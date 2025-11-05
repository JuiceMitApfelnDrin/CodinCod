defmodule CodincodApiWeb.AccountPreferenceController do
  @moduledoc """
  Handles account preference endpoints mirroring the Fastify implementation.

  Supports full replacement (PUT), partial updates (PATCH), retrieval and
  deletion of the authenticated user's preferences.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.Accounts
  alias CodincodApi.Accounts.{Preference, User}
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  @spec show(Plug.Conn.t(), map()) :: Plug.Conn.t()
  tags(["Account Preferences"])

  operation(:show,
    summary: "Get account preferences",
    responses: %{
      200 => {"Preferences", "application/json", Schemas.Account.PreferencesPayload},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def show(conn, _params) do
    with %User{} = user <- conn.assigns[:current_user],
         %Preference{} = preference <- Accounts.get_preferences(user) do
      json(conn, serialize(preference))
    else
      %User{} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Preferences not found"})

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid credentials"})
    end
  end

  @spec replace(Plug.Conn.t(), map()) :: Plug.Conn.t()
  operation(:replace,
    summary: "Replace preferences",
    request_body:
      {"Preferences payload", "application/json", Schemas.Account.PreferencesPayload,
       required: true},
    responses: %{
      200 => {"Updated preferences", "application/json", Schemas.Account.PreferencesPayload},
      400 => {"Invalid payload", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def replace(conn, params) do
    persist_preferences(conn, params, :replace)
  end

  @spec patch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  operation(:patch,
    summary: "Patch preferences",
    request_body: {"Partial preferences", "application/json", Schemas.Account.PreferencesPayload},
    responses: %{
      200 => {"Updated preferences", "application/json", Schemas.Account.PreferencesPayload},
      400 => {"Invalid payload", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def patch(conn, params) do
    persist_preferences(conn, params, :patch)
  end

  @spec delete(Plug.Conn.t(), map()) :: Plug.Conn.t()
  operation(:delete,
    summary: "Delete preferences",
    responses: %{
      204 => {"Preferences deleted", "application/json", nil},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def delete(conn, _params) do
    with %User{} = user <- conn.assigns[:current_user],
         :ok <- Accounts.delete_preferences(user) do
      send_resp(conn, :no_content, "")
    else
      %User{} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Preferences not found"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Preferences not found"})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to delete preferences", errors: translate_errors(changeset)})

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid credentials"})
    end
  end

  defp persist_preferences(conn, params, _mode) do
    with %User{} = user <- conn.assigns[:current_user],
         {:ok, attrs} <- normalize_params(params),
         {:ok, %Preference{} = preference} <- Accounts.upsert_preferences(user, attrs) do
      json(conn, serialize(preference))
    else
      {:error, :invalid_payload, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid payload", errors: errors})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to save preferences", errors: translate_errors(changeset)})

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid credentials"})
    end
  end

  defp normalize_params(params) when is_map(params) do
    theme_options = Preference.theme_options()

    Enum.reduce(params, {:ok, %{}}, fn
      {"preferredLanguage", value}, {:ok, acc} when is_binary(value) or is_nil(value) ->
        {:ok, Map.put(acc, :preferred_language, value)}

      {"preferredLanguage", _value}, {:ok, _acc} ->
        {:error, :invalid_payload, [%{field: "preferredLanguage", message: "must be a string"}]}

      {"theme", value}, {:ok, acc} when is_binary(value) ->
        if value in theme_options do
          {:ok, Map.put(acc, :theme, value)}
        else
          {:error, :invalid_payload,
           [%{field: "theme", message: "must be one of #{Enum.join(theme_options, ", ")}"}]}
        end

      {"theme", nil}, {:ok, acc} ->
        {:ok, Map.put(acc, :theme, nil)}

      {"theme", _value}, {:ok, _acc} ->
        {:error, :invalid_payload, [%{field: "theme", message: "must be a string or null"}]}

      {"blockedUsers", value}, {:ok, acc} when is_list(value) ->
        with {:ok, ids} <- cast_blocked_users(value) do
          {:ok, Map.put(acc, :blocked_user_ids, ids)}
        else
          {:error, error} -> {:error, :invalid_payload, [error]}
        end

      {"blockedUsers", nil}, {:ok, acc} ->
        {:ok, Map.put(acc, :blocked_user_ids, [])}

      {"blockedUsers", _value}, {:ok, _acc} ->
        {:error, :invalid_payload, [%{field: "blockedUsers", message: "must be an array"}]}

      {"editor", value}, {:ok, acc} when is_map(value) or is_nil(value) ->
        {:ok, Map.put(acc, :editor, value || %{})}

      {"editor", _value}, {:ok, _acc} ->
        {:error, :invalid_payload, [%{field: "editor", message: "must be an object"}]}

      {_other, _value}, {:ok, acc} ->
        {:ok, acc}

      {_key, _value}, {:error, reason, errors} ->
        {:error, reason, errors}
    end)
    |> case do
      {:ok, attrs} when map_size(attrs) > 0 -> {:ok, attrs}
      {:ok, _} -> {:error, :invalid_payload, [%{field: nil, message: "No changes provided"}]}
      {:error, reason, errors} -> {:error, reason, errors}
    end
  end

  defp normalize_params(_),
    do: {:error, :invalid_payload, [%{field: nil, message: "Expected JSON object"}]}

  defp cast_blocked_users(values) do
    values
    |> Enum.reduce_while({:ok, []}, fn value, {:ok, acc} ->
      case Ecto.UUID.cast(value) do
        {:ok, uuid} ->
          {:cont, {:ok, [uuid | acc]}}

        :error ->
          {:halt, {:error, %{field: "blockedUsers", message: "must contain valid UUID strings"}}}
      end
    end)
    |> case do
      {:ok, ids} -> {:ok, Enum.reverse(ids)}
      {:error, reason} -> {:error, reason}
    end
  end

  defp serialize(%Preference{} = preference) do
    %{
      preferredLanguage: preference.preferred_language,
      theme: preference.theme,
      blockedUsers: Enum.map(preference.blocked_user_ids || [], & &1),
      editor: preference.editor || %{}
    }
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
