defmodule CodincodApiWeb.GameChannelTest do
  use CodincodApiWeb.ChannelCase, async: true

  alias CodincodApiWeb.{GameChannel, UserSocket, Presence}
  alias CodincodApiWeb.Auth.Guardian
  alias CodincodApi.{Games, Accounts, Puzzles, Repo}

  # Helper to create authenticated socket
  defp authenticated_socket(user) do
    {:ok, token, _claims} = Guardian.encode_and_sign(user)
    {:ok, socket} = connect(UserSocket, %{"token" => token})
    socket
  end

  setup do
    # Create test users
    {:ok, owner} =
      Accounts.register_user(%{
        username: "game_host",
        email: "host@test.com",
        password: "password123456"
      })

    {:ok, player} =
      Accounts.register_user(%{
        username: "player_one",
        email: "player@test.com",
        password: "password123456"
      })

    # Create a test puzzle
    {:ok, puzzle} =
      Puzzles.create_puzzle(%{
        title: "Test Puzzle",
        description: "A test puzzle for multiplayer",
        difficulty: "EASY",
        author_id: owner.id,
        status: "APPROVED",
        visibility: "APPROVED"
      })

    # Create a game
    {:ok, game} =
      Games.create_game(%{
        owner_id: owner.id,
        puzzle_id: puzzle.id,
        mode: "FASTEST",
        visibility: "public",
        status: "waiting",
        max_duration_seconds: 600
      })

    # Add player to game
    {:ok, game} = Games.add_player_to_game(game, player)

    # Note: Game is in "waiting" status - tests that need "in_progress" status
    # should call Games.start_game(game) explicitly

    %{game: game, owner: owner, player: player, puzzle: puzzle}
  end

  describe "join/3" do
    test "successfully joins game channel as player", %{game: game, player: player} do
      # Create socket with user authentication
      socket = authenticated_socket(player)

      # Join the game channel
      {:ok, reply, socket} = subscribe_and_join(
        socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => player.id}
      )

      # Verify response contains game data
      assert reply.game
      assert reply.game.id == game.id
      assert reply.userId == player.id

      # Verify socket assigns are set correctly
      assert socket.assigns.game_id == game.id
      assert socket.assigns.user_id == player.id
      assert socket.assigns.username == player.username
    end

    test "rejects join if player not in game", %{game: game} do
      # Create a user NOT in the game
      {:ok, outsider} =
        Accounts.register_user(%{
          username: "outsider",
          email: "outsider@test.com",
          password: "password123456"
        })

      socket = authenticated_socket(outsider)

      # Attempt to join should fail
      assert {:error, %{reason: "You are not a player in this game"}} =
        subscribe_and_join(socket, GameChannel, "game:#{game.id}", %{"userId" => outsider.id})
    end

    test "rejects join with invalid game ID", %{player: player} do
      socket = authenticated_socket(player)

      assert {:error, %{reason: "Invalid game ID"}} =
        subscribe_and_join(socket, GameChannel, "game:invalid-uuid", %{})
    end
  end

  describe "presence tracking" do
    test "tracks player presence on join", %{game: game, player: player} do
      socket = authenticated_socket(player)

      # Join the channel
      {:ok, _reply, socket} = subscribe_and_join(
        socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => player.id}
      )

      # Wait for :after_join to process
      :timer.sleep(50)

      # Verify presence is tracked
      presences = Presence.list(socket)
      assert Map.has_key?(presences, player.id)
      assert presences[player.id].metas |> List.first() |> Map.get(:username) == player.username
    end

    test "broadcasts presence_state to joining player", %{game: game, player: player, owner: owner} do
      # Owner joins first
      owner_socket = authenticated_socket(owner)

      {:ok, _reply, _owner_socket} = subscribe_and_join(
        owner_socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => owner.id}
      )

      :timer.sleep(50)

      # Player joins second
      player_socket = authenticated_socket(player)

      {:ok, _reply, _player_socket} = subscribe_and_join(
        player_socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => player.id}
      )

      # Player should receive presence_state with owner already present
      assert_push "presence_state", presence_state
      assert Map.has_key?(presence_state, owner.id)
    end

    test "broadcasts presence_diff when player joins", %{game: game, player: player, owner: owner} do
      # Owner joins and subscribes to presence events
      owner_socket = authenticated_socket(owner)

      {:ok, _reply, _owner_socket} = subscribe_and_join(
        owner_socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => owner.id}
      )

      :timer.sleep(100)

      # Player joins
      player_socket = authenticated_socket(player)

      {:ok, _reply, _player_socket} = subscribe_and_join(
        player_socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => player.id}
      )

      :timer.sleep(50)

      # Both sockets receive presence_diff - verify player is in one of them
      # The player's join should appear in the joins map
      assert_push "presence_diff", %{joins: joins1, leaves: _}
      assert_push "presence_diff", %{joins: joins2, leaves: _}

      # One of these diffs should contain the player
      player_id_str = to_string(player.id)
      assert Map.has_key?(joins1, player_id_str) or Map.has_key?(joins2, player_id_str)
    end
  end

  describe "handle_in events" do
    setup %{game: game, player: player} do
      socket = authenticated_socket(player)

      {:ok, _reply, socket} = subscribe_and_join(
        socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => player.id}
      )

      %{socket: socket}
    end

    test "handles code_update event", %{socket: socket, player: player} do
      # Send code update
      ref = push(socket, "code_update", %{
        "code" => "print('hello')",
        "language" => "python"
      })

      assert_reply ref, :ok

      # Should broadcast to other players
      assert_broadcast "player_code_updated", %{
        userId: user_id,
        username: username,
        code: "print('hello')",
        language: "python"
      }

      assert user_id == player.id
      assert username == player.username
    end

    test "handles chat_message event", %{socket: socket, player: player} do
      ref = push(socket, "chat_message", %{"message" => "Hello everyone!"})
      assert_reply ref, :ok

      # Should broadcast to all players
      assert_broadcast "chat_message", %{
        userId: user_id,
        username: username,
        message: "Hello everyone!"
      }

      assert user_id == player.id
      assert username == player.username
    end

    test "rejects empty chat messages", %{socket: socket} do
      ref = push(socket, "chat_message", %{"message" => "   "})
      assert_reply ref, :error, %{reason: "Invalid message"}
    end

    test "handles heartbeat event", %{socket: socket} do
      ref = push(socket, "heartbeat", %{})
      assert_reply ref, :ok
    end
  end

  describe "terminate/2" do
    test "cleans up when player disconnects", %{game: game, player: player} do
      socket = authenticated_socket(player)

      {:ok, _reply, socket} = subscribe_and_join(
        socket,
        GameChannel,
        "game:#{game.id}",
        %{"userId" => player.id}
      )

      :timer.sleep(50)

      # Verify presence before disconnect
      presences = Presence.list(socket)
      assert Map.has_key?(presences, to_string(player.id))

      # Close the socket (simulates disconnect) - this will cause the channel process to exit
      Process.flag(:trap_exit, true)
      close(socket)

      # Verify we receive the exit signal (confirms terminate/2 was called)
      assert_receive {:EXIT, _pid, _reason}, 500
    end
  end
end
