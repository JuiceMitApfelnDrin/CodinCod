defmodule CodincodApiWeb.GameChannel do
  @moduledoc """
  Phoenix Channel for real-time multiplayer game communication.

  Handles:
  - Player joining/leaving with presence tracking
  - Code updates during gameplay (for spectating)
  - Submission results broadcasting
  - Turn-based coordination
  - Game state synchronization
  - Chat messages
  
  ## Events Intercepted (for custom per-socket handling)
  - `player_submitted` - Customize submission visibility based on game settings
  - `player_code_updated` - Only send to spectators in certain game modes
  
  ## Important Notes
  - Uses Phoenix.Presence for automatic player tracking
  - Presence automatically cleans up disconnected players (~30s)
  - All broadcasts are atomic to prevent race conditions
  - Terminate is called on clean disconnects only (not crashes)
  """

  use CodincodApiWeb, :channel
  require Logger

  alias CodincodApi.{Games, Accounts}
  alias CodincodApi.Games.Game
  alias CodincodApiWeb.Presence

  # Intercept these events to customize per-socket
  # This allows filtering/enriching messages before pushing to individual clients
  intercept ["player_submitted", "player_code_updated"]

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
    # This will be intercepted and filtered in handle_out/3
    broadcast!(socket, "player_code_updated", %{
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
    # This will be intercepted for per-socket customization
    broadcast!(socket, "player_submitted", %{
      userId: user_id,
      username: username,
      status: payload["status"],
      executionTime: payload["executionTime"],
      timestamp: DateTime.utc_now()
    })

    # Check if game should end (atomically with locking to prevent race conditions)
    game = Games.get_game!(game_id, preload: [:owner, :puzzle, players: :user])

    case Games.check_and_complete_game(game) do
      {:ok, :completed, completed_game} ->
        # Game is now complete, broadcast to all players
        broadcast!(socket, "game_completed", %{
          status: "completed",
          endedAt: completed_game.ended_at,
          winner: get_winner(completed_game),
          timestamp: DateTime.utc_now()
        })

      {:ok, :in_progress, _game} ->
        # Game still ongoing, broadcast state update
        broadcast!(socket, "game_state_updated", %{
          status: "in_progress",
          timestamp: DateTime.utc_now()
        })

      {:error, reason} ->
        Logger.error("Failed to check game completion: #{inspect(reason)}")
        # Don't fail the submission - game state check is non-critical
    end

    {:reply, :ok, socket}
  end

  ## Outgoing event interception
  # These callbacks allow customizing messages before they reach individual clients

  @impl true
  def handle_out("player_submitted", payload, socket) do
    game = socket.assigns.game
    user_id = socket.assigns.user_id

    # Customize submission visibility based on game settings
    # Example: In "fastest wins" mode, hide other players' submission details until game ends
    case should_show_submission?(game, user_id, payload) do
      true ->
        push(socket, "player_submitted", payload)
        {:noreply, socket}
      
      false ->
        # Send redacted version - they know someone submitted but not the details
        redacted_payload = %{
          userId: payload.userId,
          username: payload.username,
          timestamp: payload.timestamp
          # Omit: status, executionTime
        }
        push(socket, "player_submitted", redacted_payload)
        {:noreply, socket}
    end
  end

  @impl true
  def handle_out("player_code_updated", payload, socket) do
    game = socket.assigns.game
    
    # Only send code updates in collaborative/spectator modes
    # This prevents cheating in competitive modes
    if game.mode in ["COLLABORATIVE", "SPECTATOR"] do
      push(socket, "player_code_updated", payload)
    end
    
    {:noreply, socket}
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

    # Log different termination reasons for debugging
    case reason do
      {:shutdown, :left} ->
        Logger.info("Player #{username} (#{user_id}) left game #{game_id} cleanly")
      
      {:shutdown, :closed} ->
        Logger.info("Player #{username} (#{user_id}) connection closed for game #{game_id}")
      
      {:shutdown, reason} ->
        Logger.warning("Player #{username} (#{user_id}) left game #{game_id}, shutdown: #{inspect(reason)}")
      
      :normal ->
        Logger.info("Player #{username} (#{user_id}) channel terminated normally for game #{game_id}")
      
      other ->
        Logger.warning("Player #{username} (#{user_id}) left game #{game_id}, unexpected reason: #{inspect(other)}")
    end

    # Phoenix.Presence automatically cleans up presence entries
    # This happens within ~30 seconds via the Presence heartbeat mechanism
    # No manual cleanup needed - this is a key advantage of Phoenix.Presence
    
    # Optional: Mark player as disconnected in database for game logic
    # This is useful if you want immediate feedback (before Presence cleanup)
    # Games.mark_player_disconnected(game_id, user_id)

    :ok
  end

  ## Private functions

  defp should_show_submission?(_game, user_id, %{userId: submitter_id}) when user_id == submitter_id do
    # Always show player their own submission
    true
  end

  defp should_show_submission?(%Game{mode: "FASTEST"}, _user_id, _payload) do
    # In fastest mode, hide other players' submission details until game ends
    false
  end

  defp should_show_submission?(_game, _user_id, _payload) do
    # Default: show all submissions
    true
  end

  defp get_winner(%Game{} = game) do
    # TODO: Implement winner logic based on game.player_submissions
    # For now, return nil
    nil
  end

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
