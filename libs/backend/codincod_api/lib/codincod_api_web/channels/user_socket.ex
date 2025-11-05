defmodule CodincodApiWeb.UserSocket do
  @moduledoc """
  WebSocket endpoint for real-time features.
  """

  use Phoenix.Socket

  # Channels
  channel "game:*", CodincodApiWeb.GameChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    # Verify JWT token and extract user_id
    case CodincodApiWeb.Auth.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        user_id = claims["sub"]
        {:ok, assign(socket, :current_user_id, user_id)}

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info) do
    :error
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end
