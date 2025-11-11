defmodule CodincodApiWeb.Presence do
  @moduledoc """
  Phoenix.Presence implementation for real-time player tracking.

  Automatically tracks which users are connected to channels and cleans up
  when they disconnect. This solves the "ghost player" problem by ensuring
  presence state always reflects reality.

  ## Usage

  Track a user in a channel:

      {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
        username: socket.assigns.username,
        joined_at: System.system_time(:second)
      })

  Get all presences in a channel:

      presences = Presence.list(socket)

  ## Events

  Clients automatically receive:
  - `presence_state` - Full state when joining
  - `presence_diff` - Incremental updates (joins/leaves)

  ## Cleanup

  Phoenix.Presence automatically removes entries when processes terminate,
  typically within 30 seconds of disconnection.
  """

  use Phoenix.Presence,
    otp_app: :codincod_api,
    pubsub_server: CodincodApi.PubSub
end
