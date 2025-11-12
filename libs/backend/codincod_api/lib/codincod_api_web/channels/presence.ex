defmodule CodincodApiWeb.Presence do
  @moduledoc """
  Phoenix.Presence implementation for real-time player tracking.

  Automatically tracks which users are connected to channels and replicates
  state across all nodes in a cluster. This solves the "ghost player" problem
  by ensuring presence state always reflects reality.

  ## Features

  - **No single point of failure**: Distributed across all nodes
  - **Self-healing**: Automatically recovers from network partitions
  - **Automatic cleanup**: Removes entries when processes terminate (~30s)
  - **CRDT-based**: Conflict-free replicated data type for consistency

  ## Usage in Channels

  Track a user in a channel:

      {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
        username: socket.assigns.username,
        joined_at: System.system_time(:second)
      })

  Get all presences in a channel:

      presences = Presence.list(socket)

  ## Client-Side Events

  Clients automatically receive:
  - `presence_state` - Full state when joining
  - `presence_diff` - Incremental updates (joins/leaves)

  Use the phoenix.js Presence module to handle these events:

      import {Presence} from "phoenix"
      let presence = new Presence(channel)
      presence.onSync(() => {
        // Update UI with presence.list()
      })

  ## Advanced: Custom Presence Logic

  This module can be extended with callbacks for custom behavior:
  - `init/1` - Initialize state (useful for tracking additional data)
  - `fetch/2` - Customize presence data (e.g., fetch from database)
  - `handle_metas/4` - React to joins/leaves (e.g., broadcast custom events)

  ## Cleanup

  Phoenix.Presence automatically removes entries when processes terminate.
  Cleanup typically happens within 30 seconds via the Presence heartbeat
  mechanism. No manual cleanup is needed.

  ## Monitoring

  You can monitor presence state changes by subscribing to the PubSub topic:

      Phoenix.PubSub.subscribe(CodincodApi.PubSub, "presence:topic_name")

  ## Performance

  Presence is highly efficient:
  - Uses Distributed Erlang for synchronization
  - CRDT ensures eventual consistency without coordination
  - Minimal network overhead (only diffs are sent)
  - Scales to thousands of concurrent users per topic
  """

  use Phoenix.Presence,
    otp_app: :codincod_api,
    pubsub_server: CodincodApi.PubSub

  @doc """
  Initialize presence state.

  This callback is optional but useful for tracking metadata or
  setting up monitoring.
  """
  def init(_opts) do
    # Start with empty state
    # State is a map of presence_id => presence_meta
    {:ok, %{}}
  end

  @doc """
  Fetch and customize presence data.

  This callback allows enriching presence data before sending to clients.
  For example, you could fetch user details from the database.

  ## Example

      def fetch(_topic, presences) do
        # Fetch user details from database
        user_ids = Map.keys(presences)
        users = Accounts.get_users_by_ids(user_ids)

        # Enrich presence data
        for {key, %{metas: metas}} <- presences, into: %{} do
          user = Map.get(users, key)
          {key, %{
            metas: metas,
            user: %{
              id: user.id,
              username: user.username,
              avatar: user.avatar_url
            }
          }}
        end
      end
  """
  def fetch(_topic, presences) do
    # Default implementation: return presences as-is
    # Override this to customize presence data
    presences
  end

  @doc """
  Handle presence metadata changes (joins/leaves).

  This callback is triggered whenever presences join or leave a topic.
  Useful for broadcasting custom events or updating external state.

  ## Parameters

  - `topic` - The presence topic (e.g., "game:123")
  - `joins` - Map of user_id => presence_meta for users joining
  - `leaves` - Map of user_id => presence_meta for users leaving
  - `presences` - Current full presence state
  - `state` - Custom state (from init/1)

  ## Example

      def handle_metas(topic, %{joins: joins, leaves: leaves}, presences, state) do
        # Broadcast join events
        for {user_id, presence} <- joins do
          CodincodApiWeb.Endpoint.broadcast!(topic, "user_joined", %{
            user_id: user_id,
            username: presence.username
          })
        end

        # Broadcast leave events
        for {user_id, presence} <- leaves do
          CodincodApiWeb.Endpoint.broadcast!(topic, "user_left", %{
            user_id: user_id,
            username: presence.username
          })
        end

        {:ok, state}
      end
  """
  # Uncomment and customize if needed:
  # def handle_metas(topic, %{joins: joins, leaves: leaves}, presences, state) do
  #   {:ok, state}
  # end
end
