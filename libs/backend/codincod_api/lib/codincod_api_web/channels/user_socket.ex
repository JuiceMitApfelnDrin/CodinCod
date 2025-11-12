defmodule CodincodApiWeb.UserSocket do
  @moduledoc """
  WebSocket endpoint for real-time features.
  """

  use Phoenix.Socket
  require Logger

  # Channels
  channel "game:*", CodincodApiWeb.GameChannel
  channel "waiting_room:*", CodincodApiWeb.WaitingRoomChannel

  @token_cookie Application.compile_env(:codincod_api, :auth_cookie, name: "token")
                |> Keyword.get(:name, "token")

  @impl true
  def connect(params, socket, connect_info) do
    try do
      # Debug: Log connection attempt
      Logger.debug("WebSocket connect attempt")
      Logger.debug("  Connect info keys: #{inspect(Map.keys(connect_info))}")
      Logger.debug("  Params keys: #{inspect(Map.keys(params))}")

      # Try authentication methods in order of security preference:
      # 1. HTTP-only cookies (most secure - not accessible to JavaScript)
      # 2. Connection params (Phoenix.Socket standard approach via token)
      # 3. Sec-WebSocket-Protocol header (alternative WebSocket auth pattern)
      # 4. Authorization header (standard but rarely works with WebSocket)
      token = get_token_from_cookies(connect_info) ||
              get_token_from_params(params) ||
              get_token_from_websocket_protocol(connect_info) ||
              get_token_from_auth_header(connect_info)

      case token do
        nil ->
          Logger.warning("WebSocket connection rejected: no valid authentication token found")
          Logger.debug("  Tried cookies: #{has_cookie_header?(connect_info)}")
          Logger.debug("  Tried params: #{Map.has_key?(params, "token")}")
          # Return error tuple instead of atom for better client feedback
          {:error, %{reason: :unauthorized, message: "Authentication required"}}

        token_value ->
          # Verify JWT token and extract user_id
          case CodincodApiWeb.Auth.Guardian.decode_and_verify(token_value) do
            {:ok, claims} ->
              user_id = claims["sub"]
              auth_method = get_auth_method(connect_info, params)
              Logger.info("WebSocket connection accepted for user: #{user_id} (auth: #{auth_method})")

              # Store both user_id and authentication metadata for monitoring
              socket = socket
                |> assign(:current_user_id, user_id)
                |> assign(:authenticated_at, System.system_time(:second))
                |> assign(:auth_method, auth_method)

              {:ok, socket}

            {:error, :token_expired} ->
              Logger.warning("WebSocket connection rejected: token expired")
              {:error, %{reason: :token_expired, message: "Authentication token expired"}}

            {:error, :invalid_token} ->
              Logger.warning("WebSocket connection rejected: invalid token format")
              {:error, %{reason: :invalid_token, message: "Invalid authentication token"}}

            {:error, reason} ->
              Logger.warning("WebSocket connection rejected: #{inspect(reason)}")
              {:error, %{reason: :auth_failed, message: "Authentication failed"}}
          end
      end
    rescue
      e ->
        Logger.error("WebSocket connection crashed: #{inspect(e)}")
        Logger.error("  Stacktrace: #{inspect(__STACKTRACE__)}")
        {:error, %{reason: :internal_error, message: "Connection failed"}}
    end
  end

  # Helper to determine which auth method was used (for logging)
  defp get_auth_method(connect_info, params) do
    cond do
      get_token_from_cookies(connect_info) != nil -> "cookie"
      get_token_from_websocket_protocol(connect_info) != nil -> "websocket-protocol"
      get_token_from_auth_header(connect_info) != nil -> "header"
      get_token_from_params(params) != nil -> "params (deprecated)"
      true -> "unknown"
    end
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"

  # Extract token from connection params
  # Phoenix.Socket standard approach: pass token in params during handshake
  # This is secure because:
  # 1. The token is sent in the WebSocket upgrade request body (not URL)
  # 2. Phoenix uses it immediately for authentication
  # 3. It's not logged or stored in server/proxy logs
  # 4. This is the recommended approach in Phoenix docs
  defp get_token_from_params(%{"token" => token}) when is_binary(token) and token != "" do
    Logger.debug("Token found in connection params (recommended Phoenix approach)")
    Logger.debug("  Token length: #{String.length(token)}")
    token
  end

  defp get_token_from_params(params) do
    Logger.debug("No token in params. Available keys: #{inspect(Map.keys(params))}")
    nil
  end

  defp has_cookie_header?(%{x_headers: headers}) do
    Enum.any?(headers, fn {key, _} -> key == "cookie" end)
  end

  defp has_cookie_header?(_), do: false

  # Extract token from HTTP-only cookie
  defp get_token_from_cookies(%{x_headers: headers}) do
    Logger.debug("Checking cookies in headers...")
    Logger.debug("All headers: #{inspect(headers)}")
    result = headers
    |> Enum.find_value(fn
      {"cookie", cookie_string} ->
        Logger.debug("Found cookie header: #{String.slice(cookie_string, 0, 100)}...")
        parse_cookie_for_token(cookie_string)

      _ ->
        nil
    end)

    if result do
      Logger.debug("Token found in cookies: #{String.slice(result, 0, 20)}...")
    else
      Logger.debug("No token found in cookies")
    end

    result
  end

  defp get_token_from_cookies(connect_info) do
    Logger.debug("No x_headers in connect_info. Available keys: #{inspect(Map.keys(connect_info))}")
    nil
  end

  # Extract token from Authorization header (standard approach)
  defp get_token_from_auth_header(%{x_headers: headers}) do
    headers
    |> Enum.find_value(fn
      {"authorization", "Bearer " <> token} -> token
      {"authorization", token} -> token
      _ -> nil
    end)
  end

  defp get_token_from_auth_header(_), do: nil

  # Extract token from Sec-WebSocket-Protocol header
  # Phoenix.js sends tokens in the format:
  # Sec-WebSocket-Protocol: phoenix, base64url.bearer.phx.BASE64_TOKEN
  # We need to decode the base64 token and return the JWT
  defp get_token_from_websocket_protocol(%{x_headers: headers}) do
    Logger.debug("Checking sec-websocket-protocol header...")
    result = headers
    |> Enum.find_value(fn
      {"sec-websocket-protocol", protocols} ->
        Logger.debug("Found sec-websocket-protocol header: #{String.slice(protocols, 0, 50)}...")

        # Phoenix format: "phoenix, base64url.bearer.phx.BASE64_TOKEN"
        # Split by comma and look for the encoded token
        protocols
        |> String.split(",")
        |> Enum.map(&String.trim/1)
        |> Enum.find_value(fn protocol ->
          case String.split(protocol, "base64url.bearer.phx.", parts: 2) do
            [_, encoded_token] ->
              Logger.debug("Found Phoenix auth token, decoding...")
              # Decode base64 (Phoenix removes = padding, so add it back if needed)
              padded = case rem(String.length(encoded_token), 4) do
                0 -> encoded_token
                n -> encoded_token <> String.duplicate("=", 4 - n)
              end

              case Base.decode64(padded) do
                {:ok, token} ->
                  Logger.debug("Successfully decoded token: #{String.slice(token, 0, 20)}...")
                  token
                {:error, _} ->
                  Logger.debug("Failed to decode base64 token")
                  nil
              end

            _ ->
              # Fallback: Check if it looks like a JWT token directly
              parts = String.split(protocol, ".")
              is_token = length(parts) == 3 && String.length(protocol) > 20
              if is_token do
                Logger.debug("Found JWT token in protocols: #{String.slice(protocol, 0, 20)}...")
                protocol
              else
                nil
              end
          end
        end)

      _ ->
        nil
    end)

    if result do
      Logger.debug("Token found in websocket-protocol")
    else
      Logger.debug("No token found in websocket-protocol")
    end

    result
  end

  defp get_token_from_websocket_protocol(_), do: nil

  defp parse_cookie_for_token(cookie_string) do
    cookie_string
    |> String.split(";")
    |> Enum.find_value(fn cookie ->
      case String.split(cookie, "=", parts: 2) do
        [key, value] ->
          trimmed_key = String.trim(key)
          if trimmed_key == @token_cookie do
            String.trim(value)
          else
            nil
          end

        _ ->
          nil
      end
    end)
  end
end
