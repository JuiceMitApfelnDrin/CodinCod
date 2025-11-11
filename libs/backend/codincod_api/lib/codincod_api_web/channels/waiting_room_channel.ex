defmodule CodincodApiWeb.WaitingRoomChannel do
  @moduledoc """
  Phoenix Channel for real-time waiting room/lobby communication.

  Handles:
  - Room creation and joining
  - Player presence in waiting rooms
  - Room state updates
  - Chat in waiting rooms
  - Game start coordination
  """

  use CodincodApiWeb, :channel
  require Logger

  alias CodincodApi.{Games, Accounts, Puzzles}
  alias CodincodApiWeb.Presence

  @impl true
  def join("waiting_room:lobby", _payload, socket) do
    Logger.debug("User joining waiting room lobby")

    # Anyone can join the lobby to see available rooms
    send(self(), :after_join)

    {:ok, %{rooms: list_waiting_rooms()}, socket}
  end

  @impl true
  def join("waiting_room:" <> room_id, payload, socket) do
    Logger.debug("Attempting to join waiting room: #{room_id}")

    with {:ok, room_uuid} <- parse_uuid(room_id),
         {:ok, user_id} <- get_user_id(payload, socket),
         {:ok, user} <- Accounts.fetch_user(user_id),
         game <- Games.get_game!(room_uuid, preload: [:owner, :puzzle, players: :user]),
         :ok <- verify_game_is_waiting(game),
         {:ok, updated_game} <- Games.add_player_to_game(game, user) do

      send(self(), :after_join)

      socket =
        socket
        |> assign(:room_id, room_uuid)
        |> assign(:game, updated_game)
        |> assign(:user_id, user_id)
        |> assign(:username, user.username)

      {:ok, %{room: serialize_room(updated_game)}, socket}
    else
      {:error, :invalid_uuid} ->
        {:error, %{reason: "Invalid room ID"}}

      {:error, :not_waiting} ->
        {:error, %{reason: "Game has already started or finished"}}

      {:error, :room_full} ->
        {:error, %{reason: "Room is full"}}

      {:error, :not_found} ->
        {:error, %{reason: "Room not found"}}

      {:error, :unauthorized} ->
        {:error, %{reason: "Authentication required"}}

      error ->
        Logger.error("Failed to join waiting room: #{inspect(error)}")
        {:error, %{reason: "Failed to join waiting room"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    case socket.topic do
      "waiting_room:lobby" ->
        # Track presence in lobby (no specific room)
        if user_id = socket.assigns[:current_user_id] do
          {:ok, _} = Presence.track(socket, user_id, %{
            online_at: System.system_time(:second),
            in_lobby: true
          })
        end

        # Broadcast room list updates
        broadcast!(socket, "overview_of_rooms", %{
          event: "overview_of_rooms",
          rooms: list_waiting_rooms()
        })

      "waiting_room:" <> _room_id ->
        # Track presence in specific room
        user_id = socket.assigns.user_id
        username = socket.assigns.username

        {:ok, _} = Presence.track(socket, user_id, %{
          username: username,
          online_at: System.system_time(:second)
        })

        # Announce player joined to room
        game = socket.assigns.game

        broadcast!(socket, "overview_room", %{
          event: "overview_room",
          room: serialize_room(game)
        })

        # Push presence state to joining player
        push(socket, "presence_state", Presence.list(socket))

        Logger.info("Player #{username} joined room #{socket.assigns.room_id}")

      _ ->
        :ok
    end

    {:noreply, socket}
  end

  ## Incoming events

  @impl true
  def handle_in("host_room", payload, socket) do
    user_id = socket.assigns[:user_id] || get_user_from_socket(socket)

    with {:ok, _user} <- Accounts.fetch_user(user_id),
         {:ok, puzzle} <- get_random_puzzle(payload),
         game_params <- build_game_params(payload, puzzle.id, user_id),
         {:ok, game} <- Games.create_game(game_params),
         game <- Games.get_game!(game.id, preload: [:owner, :puzzle, players: :user]) do

      # Broadcast new room to lobby
      broadcast_from!(socket, "overview_of_rooms", %{
        event: "overview_of_rooms",
        rooms: list_waiting_rooms()
      })

      # Tell the creator to join the room-specific channel
      push(socket, "room_created", %{
        event: "room_created",
        roomId: game.id
      })

      {:reply, {:ok, %{roomId: game.id}}, socket}
    else
      {:error, :no_puzzles} ->
        push(socket, "not_enough_puzzles", %{
          event: "not_enough_puzzles",
          message: "Not enough active puzzles available. Please create some puzzles first."
        })
        {:reply, {:error, %{reason: "No puzzles available"}}, socket}

      {:error, reason} ->
        Logger.error("Failed to create room: #{inspect(reason)}")
        {:reply, {:error, %{reason: "Failed to create room"}}, socket}
    end
  end

  @impl true
  def handle_in("join_room", %{"roomId" => room_id}, socket) do
    # This should only be called from the lobby channel
    # It tells the client to connect to the room-specific channel
    case socket.topic do
      "waiting_room:lobby" ->
        # Validate room exists and is waiting
        with {:ok, room_uuid} <- parse_uuid(room_id),
             {:ok, game} <- fetch_game_safely(room_uuid),
             :ok <- verify_game_is_waiting(game) do

          # Tell client to join room-specific channel
          {:reply, {:ok, %{roomId: room_id}}, socket}
        else
          error ->
            Logger.error("Failed to validate room #{room_id}: #{inspect(error)}")
            {:reply, {:error, %{reason: "Room not available"}}, socket}
        end

      _ ->
        # Shouldn't happen - join_room should only be called on lobby
        {:reply, {:error, %{reason: "Invalid channel for join_room"}}, socket}
    end
  end

  @impl true
  def handle_in("join_by_invite_code", %{"inviteCode" => invite_code}, socket) do
    # Validate and tell client to join room
    handle_in("join_room", %{"roomId" => invite_code}, socket)
  end

  @impl true
  def handle_in("leave_room", %{"roomId" => room_id}, socket) do
    user_id = socket.assigns[:user_id] || get_user_from_socket(socket)

    # Only allow leaving from room-specific channel
    case socket.topic do
      "waiting_room:" <> ^room_id ->
        with {:ok, room_uuid} <- parse_uuid(room_id),
             game <- Games.get_game!(room_uuid, preload: [:owner, :puzzle, players: :user]),
             {:ok, updated_game} <- Games.remove_player_from_game(game, user_id) do

          if updated_game do
            # Game still exists, broadcast update to remaining players
            broadcast!(socket, "overview_room", %{
              event: "overview_room",
              room: serialize_room(updated_game)
            })

            # Update lobby with new room list
            CodincodApiWeb.Endpoint.broadcast!("waiting_room:lobby", "overview_of_rooms", %{
              event: "overview_of_rooms",
              rooms: list_waiting_rooms()
            })
          else
            # Game was deleted (owner left), update lobby
            CodincodApiWeb.Endpoint.broadcast!("waiting_room:lobby", "overview_of_rooms", %{
              event: "overview_of_rooms",
              rooms: list_waiting_rooms()
            })
          end

          {:reply, :ok, socket}
        else
          error ->
            Logger.error("Failed to leave room: #{inspect(error)}")
            {:reply, {:error, %{reason: "Failed to leave room"}}, socket}
        end

      _ ->
        # Called from lobby or wrong room channel
        {:reply, {:error, %{reason: "Must be in room to leave it"}}, socket}
    end
  end

  @impl true
  def handle_in("start_game", %{"roomId" => room_id}, socket) do
    user_id = socket.assigns[:user_id] || get_user_from_socket(socket)

    # Only allow starting from room-specific channel
    case socket.topic do
      "waiting_room:" <> ^room_id ->
        with {:ok, room_uuid} <- parse_uuid(room_id),
             game <- Games.get_game!(room_uuid, preload: [:owner, :puzzle, players: :user]),
             :ok <- verify_is_owner(game, user_id),
             :ok <- verify_game_is_waiting(game),
             {:ok, started_game} <- Games.start_game(game) do

          # Calculate start time (5 seconds from now for countdown)
          start_time = DateTime.add(DateTime.utc_now(), 5, :second)

          # Broadcast game start ONLY to players in this room's channel
          broadcast!(socket, "start_game", %{
            event: "start_game",
            gameUrl: "/multiplayer/#{started_game.id}",
            startTime: start_time
          })

          # Update lobby (remove this room from waiting list)
          CodincodApiWeb.Endpoint.broadcast!("waiting_room:lobby", "overview_of_rooms", %{
            event: "overview_of_rooms",
            rooms: list_waiting_rooms()
          })

          {:reply, {:ok, %{gameUrl: "/multiplayer/#{started_game.id}"}}, socket}
        else
          {:error, :not_owner} ->
            {:reply, {:error, %{reason: "Only the room owner can start the game"}}, socket}

          error ->
            Logger.error("Failed to start game: #{inspect(error)}")
            {:reply, {:error, %{reason: "Failed to start game"}}, socket}
        end

      _ ->
        # Called from lobby or wrong channel
        {:reply, {:error, %{reason: "Must be in room to start game"}}, socket}
    end
  end

  @impl true
  def handle_in("chat_message", %{"roomId" => room_id, "message" => message}, socket) do
    username = socket.assigns[:username] || "Anonymous"

    # Only allow chat in room-specific channel
    case socket.topic do
      "waiting_room:" <> ^room_id ->
        if String.trim(message) != "" && String.length(message) <= 500 do
          # Broadcast to room channel only
          broadcast!(socket, "chat_message", %{
            event: "chat_message",
            username: username,
            message: String.trim(message),
            createdAt: DateTime.utc_now()
          })

          {:reply, :ok, socket}
        else
          {:reply, {:error, %{reason: "Invalid message"}}, socket}
        end

      _ ->
        {:reply, {:error, %{reason: "Must be in room to chat"}}, socket}
    end
  end

  @impl true
  def handle_in("heartbeat", _payload, socket) do
    # Client-side heartbeat to keep channel alive
    # Simply acknowledge it
    {:reply, :ok, socket}
  end

  ## Lifecycle callbacks

  @impl true
  def terminate(reason, socket) do
    case socket.topic do
      "waiting_room:lobby" ->
        # Just tracking presence in lobby, no cleanup needed
        Logger.debug("User left lobby, reason: #{inspect(reason)}")
        :ok

      "waiting_room:" <> room_id ->
        # Player disconnected from waiting room, remove them
        user_id = socket.assigns[:user_id]
        username = socket.assigns[:username]

        Logger.info("Player #{username} (#{user_id}) left waiting room #{room_id}, reason: #{inspect(reason)}")

        # Clean up: remove player from game
        if user_id do
          with {:ok, room_uuid} <- parse_uuid(room_id),
               {:ok, game} <- fetch_game_safely(room_uuid) do
            remove_player_and_broadcast(game, user_id)
          else
            error ->
              Logger.warning("Failed to cleanup player on disconnect: #{inspect(error)}")
          end
        end

        :ok

      _ ->
        :ok
    end
  end

  ## Helper functions

  defp list_waiting_rooms do
    Games.list_waiting_rooms()
    |> Enum.map(fn game ->
      %{
        roomId: game.id,
        amountOfPlayersJoined: length(game.players || [])
      }
    end)
  end

  defp serialize_room(game) do
    %{
      roomId: game.id,
      owner: %{
        userId: game.owner.id,
        username: game.owner.username
      },
      users: Enum.map(game.players || [], fn player ->
        %{
          userId: player.user.id,
          username: player.user.username
        }
      end),
      inviteCode: game.id  # Use game ID as invite code for now
    }
  end

  defp parse_uuid(id_string) do
    case Ecto.UUID.cast(id_string) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, :invalid_uuid}
    end
  end

  defp get_user_id(_payload, socket) do
    case socket.assigns[:current_user_id] do
      nil -> {:error, :unauthorized}
      user_id -> {:ok, user_id}
    end
  end

  defp get_user_from_socket(socket) do
    socket.assigns[:current_user_id]
  end

  defp fetch_game_safely(room_uuid) do
    try do
      game = Games.get_game!(room_uuid, preload: [:owner, :puzzle, players: :user])
      {:ok, game}
    rescue
      Ecto.NoResultsError ->
        {:error, :not_found}
      e ->
        Logger.error("Error fetching game: #{inspect(e)}")
        {:error, :fetch_error}
    end
  end

  defp verify_game_is_waiting(game) do
    if game.status == "waiting" do
      :ok
    else
      {:error, :not_waiting}
    end
  end

  defp verify_is_owner(game, user_id) do
    if game.owner_id == user_id do
      :ok
    else
      {:error, :not_owner}
    end
  end

  defp get_random_puzzle(_payload) do
    # Get a random active puzzle
    case Puzzles.get_random_puzzle() do
      nil -> {:error, :no_puzzles}
      puzzle -> {:ok, puzzle}
    end
  end

  defp build_game_params(payload, puzzle_id, owner_id) do
    %{
      puzzle_id: puzzle_id,
      owner_id: owner_id,
      max_duration_seconds: Map.get(payload, "timeLimit", 900),  # Default 5 minutes
      mode: String.upcase(Map.get(payload, "gameMode", "FASTEST")),
      visibility: "public",
      status: "waiting"
    }
  end

  defp remove_player_and_broadcast(game, user_id) do
    case Games.remove_player_from_game(game, user_id) do
      {:ok, updated_game} when not is_nil(updated_game) ->
        # Game still exists, broadcast update to remaining players
        CodincodApiWeb.Endpoint.broadcast!("waiting_room:#{game.id}", "overview_room", %{
          event: "overview_room",
          room: serialize_room(updated_game)
        })

        # Update lobby with new room list
        CodincodApiWeb.Endpoint.broadcast!("waiting_room:lobby", "overview_of_rooms", %{
          event: "overview_of_rooms",
          rooms: list_waiting_rooms()
        })

      {:ok, nil} ->
        # Game was deleted (owner left or last player left)
        Logger.info("Waiting room #{game.id} was deleted")

        # Update lobby to remove this room
        CodincodApiWeb.Endpoint.broadcast!("waiting_room:lobby", "overview_of_rooms", %{
          event: "overview_of_rooms",
          rooms: list_waiting_rooms()
        })

      error ->
        Logger.error("Failed to remove player #{user_id} from game #{game.id}: #{inspect(error)}")
    end
  end
end
