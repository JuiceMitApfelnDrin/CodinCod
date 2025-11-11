defmodule CodincodApiWeb.GameChannel do
  @moduledoc """
  Phoenix Channel for real-time multiplayer game communication.

  Handles:
  - Player joining/leaving
  - Code updates during gameplay
  - Submission results broadcasting
  - Turn-based coordination
  - Game state synchronization
  """

  use CodincodApiWeb, :channel
  require Logger

  alias CodincodApi.{Games, Accounts}
  alias CodincodApi.Games.Game
  alias CodincodApiWeb.Presence

  @impl true
  def join("game:" <> game_id, payload, socket) do
    Logger.debug("Attempting to join game channel: game:#{game_id}")

    with {:ok, game_uuid} <- parse_uuid(game_id),
         {:ok, user_id} <- get_user_id(payload, socket),
         {:ok, user} <- Accounts.fetch_user(user_id),
         game <- Games.get_game!(game_uuid, preload: [:owner, :puzzle, players: :user]),
         :ok <- verify_player_in_game(game, user_id) do
      # Track user presence
      send(self(), :after_join)

      socket =
        socket
        |> assign(:game_id, game_uuid)
        |> assign(:game, game)
        |> assign(:user_id, user_id)
        |> assign(:username, user.username)

      {:ok, %{game: serialize_game(game), userId: user_id}, socket}
    else
      {:error, :invalid_uuid} ->
        {:error, %{reason: "Invalid game ID"}}

      {:error, :not_in_game} ->
        {:error, %{reason: "You are not a player in this game"}}

      {:error, :not_found} ->
        {:error, %{reason: "Game not found"}}

      {:error, :unauthorized} ->
        {:error, %{reason: "Authentication required"}}

      error ->
        Logger.error("Failed to join game channel: #{inspect(error)}")
        {:error, %{reason: "Failed to join game"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    _game_id = socket.assigns.game_id
    user_id = socket.assigns.user_id
    username = socket.assigns.username

    # Track presence using Phoenix.Presence
    # This will automatically clean up when the player disconnects
    {:ok, _} = Presence.track(socket, user_id, %{
      username: username,
      online_at: System.system_time(:second)
    })

    # Push current presence state to the joining player
    push(socket, "presence_state", Presence.list(socket))

    # Announce player presence to others
    broadcast_from!(socket, "player_online", %{
      userId: user_id,
      username: username,
      timestamp: DateTime.utc_now()
    })

    {:noreply, socket}
  end

  ## Incoming events

  @impl true
  def handle_in("code_update", %{"code" => code, "language" => language}, socket) do
    user_id = socket.assigns.user_id
    username = socket.assigns.username

    # Broadcast code changes to other players (for spectating/collaborative modes)
    broadcast_from!(socket, "player_code_updated", %{
      userId: user_id,
      username: username,
      code: code,
      language: language,
      timestamp: DateTime.utc_now()
    })

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("submission_result", payload, socket) do
    user_id = socket.assigns.user_id
    username = socket.assigns.username
    game_id = socket.assigns.game_id

    # Broadcast submission results to all players
    broadcast!(socket, "player_submitted", %{
      userId: user_id,
      username: username,
      status: payload["status"],
      executionTime: payload["executionTime"],
      timestamp: DateTime.utc_now()
    })

    # Check if game should end (atomically with locking)
    game = Games.get_game!(game_id, preload: [:owner, :puzzle, players: :user])

    case Games.check_and_complete_game(game) do
      {:ok, :completed, completed_game} ->
        # Game is now complete, broadcast to all players
        broadcast!(socket, "game_completed", %{
          status: "completed",
          endedAt: completed_game.ended_at,
          timestamp: DateTime.utc_now()
        })

      {:ok, :in_progress, _game} ->
        # Game still ongoing, just broadcast state update
        broadcast!(socket, "game_state_updated", %{
          status: "in_progress",
          timestamp: DateTime.utc_now()
        })

      {:error, reason} ->
        Logger.error("Failed to check game completion: #{inspect(reason)}")
    end

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("ready", _payload, socket) do
    user_id = socket.assigns.user_id
    username = socket.assigns.username

    # Announce player is ready
    broadcast!(socket, "player_ready", %{
      userId: user_id,
      username: username,
      timestamp: DateTime.utc_now()
    })

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("chat_message", %{"message" => message}, socket) do
    user_id = socket.assigns.user_id
    username = socket.assigns.username

    if String.trim(message) != "" && String.length(message) <= 500 do
      broadcast!(socket, "chat_message", %{
        userId: user_id,
        username: username,
        message: String.trim(message),
        timestamp: DateTime.utc_now()
      })

      {:reply, :ok, socket}
    else
      {:reply, {:error, %{reason: "Invalid message"}}, socket}
    end
  end

  @impl true
  def handle_in("request_hint", _payload, socket) do
    user_id = socket.assigns.user_id
    username = socket.assigns.username

    # Broadcast hint request (may consume hint credits)
    broadcast!(socket, "hint_requested", %{
      userId: user_id,
      username: username,
      timestamp: DateTime.utc_now()
    })

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("typing", %{"isTyping" => is_typing}, socket) do
    user_id = socket.assigns.user_id
    username = socket.assigns.username

    # Broadcast typing indicator
    broadcast_from!(socket, "player_typing", %{
      userId: user_id,
      username: username,
      isTyping: is_typing
    })

    {:noreply, socket}
  end

  # Catch-all for unknown events
  @impl true
  def handle_in("heartbeat", _payload, socket) do
    # Client-side heartbeat to keep channel alive
    # Simply acknowledge it
    {:reply, :ok, socket}
  end

  @impl true
  def handle_in(event, _payload, socket) do
    Logger.warning("Unknown game channel event: #{event}")
    {:reply, {:error, %{reason: "Unknown event"}}, socket}
  end

  ## Lifecycle callbacks

  @impl true
  def terminate(reason, socket) do
    user_id = socket.assigns[:user_id]
    game_id = socket.assigns[:game_id]
    username = socket.assigns[:username]

    Logger.info("Player #{username} (#{user_id}) left game #{game_id}, reason: #{inspect(reason)}")

    # Phoenix.Presence will automatically clean up the presence entry
    # No manual cleanup needed - Presence handles it within ~30 seconds

    # Optionally mark player as disconnected in database if needed for game logic
    # Games.mark_player_disconnected(game_id, user_id)

    :ok
  end

  ## Private functions

  defp get_user_id(%{"userId" => user_id}, _socket) when is_binary(user_id) do
    parse_uuid(user_id)
  end

  defp get_user_id(_payload, socket) do
    # Try to get from socket assigns (set by authentication)
    case socket.assigns[:current_user_id] do
      nil -> {:error, :unauthorized}
      user_id -> {:ok, user_id}
    end
  end

  defp verify_player_in_game(%Game{players: players}, user_id) do
    if Enum.any?(players, fn p -> p.user_id == user_id end) do
      :ok
    else
      {:error, :not_in_game}
    end
  end

  defp serialize_game(%Game{} = game) do
    %{
      id: game.id,
      status: game.status,
      mode: game.mode,
      visibility: game.visibility,
      maxDurationSeconds: game.max_duration_seconds,
      rated: game.rated,
      owner: %{
        id: game.owner.id,
        username: game.owner.username
      },
      puzzle: %{
        id: game.puzzle.id,
        title: game.puzzle.title,
        difficulty: game.puzzle.difficulty,
        statement: game.puzzle.statement
      },
      players:
        Enum.map(game.players, fn player ->
          %{
            id: player.user.id,
            username: player.user.username,
            role: player.role,
            joinedAt: player.joined_at
          }
        end),
      startedAt: game.started_at,
      endedAt: game.ended_at
    }
  end

  defp parse_uuid(value) when is_binary(value) do
    case Ecto.UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, :invalid_uuid}
    end
  end
end
