defmodule CodincodApiWeb.AuthController do
  @moduledoc """
  Authentication endpoints mirroring the legacy Fastify routes.

  Handles user registration, login, logout, and token refresh while keeping the
  token delivery mechanism (HTTP-only cookie) compatible with the existing
  frontend expectations.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs
  require Logger

  alias CodincodApi.Accounts
  alias CodincodApi.Accounts.User
  alias CodincodApiWeb.Auth.Guardian
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  @token_cookie Application.compile_env(:codincod_api, :auth_cookie, [])
                |> Keyword.get(:name, "token")
  @cookie_max_age Application.compile_env(:codincod_api, :auth_cookie, [])
                  |> Keyword.get(:max_age, 7 * 24 * 60 * 60)

  tags(["Auth"])

  operation(:register,
    summary: "Register new user",
    request_body:
      {"Registration payload", "application/json", Schemas.Auth.RegisterRequest, required: true},
    responses: %{
      200 => {"Registration success", "application/json", Schemas.Auth.MessageResponse},
      400 => {"Validation error", "application/json", Schemas.Common.ErrorResponse},
      500 => {"Server error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec register(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def register(conn, params) do
    require Logger

    attrs = %{
      username: Map.get(params, "username"),
      email: Map.get(params, "email"),
      password: Map.get(params, "password"),
      password_confirmation:
        Map.get(params, "passwordConfirmation") || Map.get(params, "password_confirmation")
    }

    # Log registration attempt (without sensitive data)
    Logger.info("Registration attempt for username: #{attrs.username}, email: #{attrs.email}")

    with {:ok, %User{} = user} <- Accounts.register_user(attrs),
         {:ok, token, _claims} <- Guardian.generate_token(user) do
      Logger.info("User registered successfully: #{user.username} (#{user.id})")

      conn
      |> put_auth_cookie(token)
      |> put_status(:ok)
      |> json(%{message: "User registered successfully"})
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        errors = translate_errors(changeset)

        # Log validation errors for debugging
        Logger.warning("Registration validation failed for #{attrs.username}: #{inspect(errors)}")

        # Provide user-friendly error messages
        message =
          cond do
            Map.has_key?(errors, :username) -> "Username validation failed"
            Map.has_key?(errors, :email) -> "Email validation failed"
            Map.has_key?(errors, :password) -> "Password validation failed"
            true -> "Registration validation failed"
          end

        conn
        |> put_status(:bad_request)
        |> json(%{
          message: message,
          errors: errors
        })

      {:error, reason} ->
        # Log the actual error for debugging
        Logger.error("Registration failed for #{attrs.username}: #{inspect(reason)}")

        conn
        |> put_status(:internal_server_error)
        |> json(%{
          message: "Registration failed. Please try again later.",
          error: "INTERNAL_ERROR"
        })
    end
  end

  operation(:login,
    summary: "Authenticate user",
    request_body: {"Credentials", "application/json", Schemas.Auth.LoginRequest, required: true},
    responses: %{
      200 => {"Login success", "application/json", Schemas.Auth.MessageResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      500 => {"Server error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec login(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def login(conn, params) do
    identifier = Map.get(params, "identifier")
    password = Map.get(params, "password")

    cond do
      !valid_identifier?(identifier) ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid username or email"})

      !is_binary(password) or password == "" ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Password is required"})

      true ->
        do_login(conn, identifier, password)
    end
  end

 defp do_login(conn, identifier, password) do
  case Accounts.authenticate(identifier, password) do
    {:ok, %User{} = user} ->
      with {:ok, token, claims} <- Guardian.generate_token(user) do
        require Logger
        Logger.info("=== LOGIN TOKEN GENERATED ===")
        Logger.info("User ID: #{user.id}")
        Logger.info("Token (first 50 chars): #{String.slice(token, 0..50)}...")
        Logger.info("Claims: #{inspect(claims)}")
        Logger.info("Cookie name: #{@token_cookie}")
        Logger.info("Setting cookie with options: #{inspect(cookie_options(:set))}")
        Logger.info("============================")

        conn
        |> put_auth_cookie(token)
        |> tap(fn conn ->
          Logger.info("Response cookies being set: #{inspect(conn.resp_cookies)}")
        end)
        |> put_status(:ok)
        |> json(%{message: "Login successful"})
      else
        {:error, reason} ->
          Logger.error("Failed to generate token: #{inspect(reason)}")
          conn
          |> put_status(:internal_server_error)
          |> json(%{message: "Failed to generate token", reason: inspect(reason)})
      end

    {:error, :invalid_credentials} ->
      conn
      |> put_status(:unauthorized)
      |> json(%{message: "Invalid email/username or password"})

    {:error, :banned} ->
      conn
      |> put_status(:forbidden)
      |> json(%{message: "User is banned"})
  end
end

  operation(:logout,
    summary: "Logout current user",
    responses: %{
      200 => {"Logout success", "application/json", Schemas.Auth.MessageResponse}
    }
  )

  @spec logout(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def logout(conn, _params) do
    conn
    |> clear_auth_cookie()
    |> put_status(:ok)
    |> json(%{message: "Logout successful"})
  end

  operation(:refresh,
    summary: "Refresh authentication token",
    responses: %{
      200 => {"Token refreshed", "application/json", Schemas.Auth.MessageResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      500 => {"Server error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec refresh(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def refresh(conn, _params) do
    case conn.assigns[:current_user] do
      %User{} = user ->
        with {:ok, token, _claims} <- Guardian.generate_token(user) do
          conn
          |> put_auth_cookie(token)
          |> put_status(:ok)
          |> json(%{message: "Token refreshed"})
        else
          {:error, reason} ->
            conn
            |> put_status(:internal_server_error)
            |> json(%{message: "Failed to refresh token", reason: inspect(reason)})
        end

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Authentication required"})
    end
  end

  operation(:websocket_token,
    summary: "Get WebSocket authentication token",
    responses: %{
      200 => {"Token retrieved", "application/json", Schemas.Auth.TokenResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec websocket_token(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def websocket_token(conn, _params) do
    case get_token_from_cookie(conn) do
      {:ok, token} ->
        conn
        |> put_status(:ok)
        |> json(%{token: token})

      :error ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Authentication required"})
    end
  end

  # Extract token from cookie for WebSocket authentication
  defp get_token_from_cookie(conn) do
    conn = Plug.Conn.fetch_cookies(conn)

    case Map.get(conn.req_cookies, @token_cookie) do
      nil -> :error
      "" -> :error
      token -> {:ok, token}
    end
  end

  defp valid_identifier?(identifier) when is_binary(identifier) do
    username_regex = User.username_regex()
    email_regex = User.email_regex()
    username_min = User.username_min_length()
    username_max = User.username_max_length()

    identifier != "" and
      (Regex.match?(email_regex, identifier) or
         (Regex.match?(username_regex, identifier) and
            String.length(identifier) in username_min..username_max))
  end

  defp valid_identifier?(_), do: false

  defp put_auth_cookie(conn, token) do
    Plug.Conn.put_resp_cookie(conn, @token_cookie, token, cookie_options(:set))
  end

  defp clear_auth_cookie(conn) do
    Plug.Conn.delete_resp_cookie(conn, @token_cookie, cookie_options(:delete))
  end

  defp cookie_options(:set) do
    base_cookie_options()
    |> Keyword.put(:max_age, @cookie_max_age)
  end

  defp cookie_options(:delete) do
    base_cookie_options()
  end

  defp base_cookie_options do
    prod? = production?()

    # Cookie settings based on environment
    # Development:
    #   - NO domain (cookie specific to the server that set it: localhost:4000)
    #   - secure: false (can't use in development with http://)
    #   - same_site: "Lax" (works for same-site requests only)
    #
    # For WebSocket to work from frontend (localhost:5173) to backend (localhost:4000),
    # we need the cookie to be sent cross-port. This is tricky:
    # - `domain: "localhost"` should work but some browsers are strict about it
    # - No domain means cookie is port-specific (localhost:4000 only)
    # - The best solution is to use the Vite proxy so everything appears on same port
    #
    # Production:
    #   - domain: from FRONTEND_HOST env var
    #   - secure: true (https:// and wss:// require secure cookies)
    #   - same_site: "None" (allows cross-domain, requires secure: true)

    base_options = [
      path: "/",
      http_only: true,
      secure: prod?,
      same_site: if(prod?, do: "None", else: "Lax")
    ]

    # In development: do NOT set domain to make cookie origin-specific
    # When accessed through Vite proxy (localhost:5173), cookie will be for that origin
    # When accessed directly (localhost:4000), cookie will be for that origin
    # This ensures cookies work properly in both scenarios
    if prod? do
      maybe_put_domain(base_options, true)
    else
      # No domain in development - cookie will be specific to the requesting origin
      base_options
    end
  end

  defp maybe_put_domain(options, true) do
    case System.get_env("FRONTEND_HOST") do
      host when is_binary(host) and host != "" -> Keyword.put(options, :domain, host)
      _ -> options
    end
  end

  defp maybe_put_domain(options, _), do: options

  defp production? do
    Application.get_env(:codincod_api, :runtime_env, :dev) == :prod
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
    |> enhance_error_messages()
  end

  # Enhance error messages for better UX
  defp enhance_error_messages(errors) do
    errors
    |> Enum.map(fn {field, messages} ->
      enhanced =
        Enum.map(messages, fn msg ->
          case {field, msg} do
            {:username, "has already been taken"} ->
              "This username is already registered. Please choose a different username."

            {:email, "has already been taken"} ->
              "This email address is already registered. Please use a different email or try logging in."

            {:password, "should be at least " <> _} ->
              "Password must be at least 14 characters long for security."

            {:password_confirmation, "does not match confirmation"} ->
              "Password confirmation does not match. Please ensure both passwords are identical."

            {:username, "has invalid format"} ->
              "Username can only contain letters, numbers, hyphens, and underscores."

            {:username, "should be at least " <> _} ->
              "Username must be at least 3 characters long."

            {:username, "should be at most " <> _} ->
              "Username cannot be longer than 20 characters."

            {:email, "has invalid format"} ->
              "Please enter a valid email address."

            {_, msg} ->
              msg
          end
        end)

      {field, enhanced}
    end)
    |> Enum.into(%{})
  end
end
