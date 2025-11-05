defmodule CodincodApiWeb.PasswordResetController do
  @moduledoc """
  Handles password reset requests and token validation.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.Accounts
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  tags(["Password Reset"])

  operation(:request_reset,
    summary: "Request password reset",
    description: "Sends password reset email if user exists",
    request_body: {"Reset request", "application/json", Schemas.PasswordReset.RequestPayload},
    responses: %{
      200 => {"Reset email sent", "application/json", Schemas.PasswordReset.RequestResponse},
      400 => {"Invalid payload", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def request_reset(conn, params) do
    with {:ok, attrs} <- normalize_request_params(params),
         base_url <- get_base_url(conn),
         {:ok, _reset} <- Accounts.request_password_reset(attrs.email, base_url) do
      # Always return success to avoid email enumeration attacks
      conn
      |> put_status(:ok)
      |> json(%{
        message: "If an account exists with this email, a password reset link has been sent."
      })
    else
      {:error, :user_not_found} ->
        # Return same success message to prevent user enumeration
        conn
        |> put_status(:ok)
        |> json(%{
          message: "If an account exists with this email, a password reset link has been sent."
        })

      {:error, :invalid_payload, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid request", errors: errors})

      {:error, _reason} ->
        # Log error internally but show generic success to user
        conn
        |> put_status(:ok)
        |> json(%{
          message: "If an account exists with this email, a password reset link has been sent."
        })
    end
  end

  operation(:reset_password,
    summary: "Reset password with token",
    description: "Validates token and updates user password",
    request_body: {"Reset payload", "application/json", Schemas.PasswordReset.ResetPayload},
    responses: %{
      200 => {"Password reset", "application/json", Schemas.PasswordReset.ResetResponse},
      400 => {"Invalid payload or token", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def reset_password(conn, params) do
    with {:ok, attrs} <- normalize_reset_params(params),
         {:ok, _user} <- Accounts.reset_password_with_token(attrs.token, attrs.password) do
      conn
      |> put_status(:ok)
      |> json(%{message: "Password successfully reset"})
    else
      {:error, :invalid_token} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid or already used reset token"})

      {:error, :expired_token} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Reset token has expired"})

      {:error, :invalid_payload, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid reset payload", errors: errors})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to reset password", errors: translate_errors(changeset)})
    end
  end

  defp normalize_request_params(params) when is_map(params) do
    case Map.get(params, "email") do
      email when is_binary(email) and byte_size(email) > 0 ->
        {:ok, %{email: String.downcase(String.trim(email))}}

      _ ->
        {:error, :invalid_payload, [%{field: "email", message: "is required"}]}
    end
  end

  defp normalize_request_params(_params), do: {:error, :invalid_payload, []}

  defp normalize_reset_params(params) when is_map(params) do
    {token, errors} = validate_required_string(Map.get(params, "token"), "token")
    {password, errors} = validate_password(Map.get(params, "password"), "password", errors)

    if errors == [] do
      {:ok, %{token: token, password: password}}
    else
      {:error, :invalid_payload, errors}
    end
  end

  defp normalize_reset_params(_params), do: {:error, :invalid_payload, []}

  defp validate_required_string(value, field, errors \\ [])

  defp validate_required_string(value, field, errors) when is_binary(value) do
    trimmed = String.trim(value)

    if trimmed == "" do
      {nil, [%{field: field, message: "cannot be empty"} | errors]}
    else
      {trimmed, errors}
    end
  end

  defp validate_required_string(_value, field, errors),
    do: {nil, [%{field: field, message: "is required"} | errors]}

  defp validate_password(value, field, errors) when is_binary(value) do
    trimmed = String.trim(value)

    cond do
      trimmed == "" ->
        {nil, [%{field: field, message: "cannot be empty"} | errors]}

      String.length(trimmed) < 8 ->
        {nil, [%{field: field, message: "must be at least 8 characters"} | errors]}

      true ->
        {trimmed, errors}
    end
  end

  defp validate_password(_value, field, errors),
    do: {nil, [%{field: field, message: "is required"} | errors]}

  defp get_base_url(conn) do
    scheme = if conn.scheme == :https, do: "https", else: "http"
    host = conn.host
    port = conn.port

    port_part =
      if (scheme == "https" and port == 443) or (scheme == "http" and port == 80) do
        ""
      else
        ":#{port}"
      end

    "#{scheme}://#{host}#{port_part}"
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
