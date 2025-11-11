defmodule CodincodApiWeb.GameController do
  @moduledoc """
  Handles game lobby creation, joining, and management for multiplayer coding challenges.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.{Games, Puzzles}
  alias CodincodApi.Accounts.User
  alias CodincodApi.Games.Game
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  tags(["Games"])

  operation(:list_waiting_rooms,
    summary: "List all waiting game lobbies",
    responses: %{
      200 => {"Waiting rooms", "application/json", Schemas.Games.WaitingRoomsResponse}
    }
  )

  def list_waiting_rooms(conn, _params) do
    rooms = Games.list_waiting_rooms()

    conn
    |> put_status(:ok)
    |> json(%{
      rooms: Enum.map(rooms, &serialize_game/1),
      count: length(rooms)
    })
  end

  operation(:create,
    summary: "Create a new game lobby",
    request_body: {"Game creation payload", "application/json", Schemas.Games.CreateGameRequest},
    responses: %{
      201 => {"Game created", "application/json", Schemas.Games.GameResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse},
      422 => {"Validation error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def create(conn, params) do
    with %User{id: user_id} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, attrs} <- normalize_create_params(params, user_id),
         {:ok, _puzzle} <- Puzzles.fetch_puzzle(attrs.puzzle_id),
         {:ok, game} <- Games.create_game(attrs) do
      conn
      |> put_status(:created)
      |> json(serialize_game(game))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :invalid_payload} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid game creation payload"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Puzzle not found"})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Validation failed", details: translate_errors(changeset)})
    end
  end

  operation(:show,
    summary: "Get game details",
    parameters: [
      id: [
        in: :path,
        description: "Game identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"Game details", "application/json", Schemas.Games.GameResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Game not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def show(conn, %{"id" => game_id}) do
    with {:ok, game_uuid} <- parse_uuid(game_id) do
      game = Games.get_game!(game_uuid, preload: [:owner, :puzzle, players: :user])

      conn
      |> put_status(:ok)
      |> json(serialize_game(game))
    else
      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid game ID"})
    end
  rescue
    Ecto.NoResultsError ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "Game not found"})
  end

  operation(:join,
    summary: "Join a game lobby",
    parameters: [
      id: [
        in: :path,
        description: "Game identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"Joined game", "application/json", Schemas.Games.GameResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Game not found", "application/json", Schemas.Common.ErrorResponse},
      409 => {"Game full or already started", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def join(conn, %{"id" => game_id}) do
    with %User{id: user_id} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, game_uuid} <- parse_uuid(game_id),
         game <- Games.get_game!(game_uuid, preload: [:owner, :puzzle, players: :user]),
         :ok <- validate_can_join(game, user_id),
         {:ok, _game_player} <- Games.join_game(game, %{user_id: user_id}) do
      # Reload game with updated players
      updated_game = Games.get_game!(game_uuid, preload: [:owner, :puzzle, players: :user])

      # Broadcast to game channel that player joined
      CodincodApiWeb.Endpoint.broadcast(
        "game:#{game_id}",
        "player_joined",
        serialize_game(updated_game)
      )

      conn
      |> put_status(:ok)
      |> json(serialize_game(updated_game))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid game ID"})

      {:error, :game_full} ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "Game is full"})

      {:error, :game_started} ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "Game has already started"})

      {:error, :already_joined} ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "Already in this game"})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Failed to join game", details: translate_errors(changeset)})
    end
  rescue
    Ecto.NoResultsError ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "Game not found"})
  end

  operation(:leave,
    summary: "Leave a game lobby",
    parameters: [
      id: [
        in: :path,
        description: "Game identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"Left game", "application/json", Schemas.Games.LeaveGameResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Game not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def leave(conn, %{"id" => game_id}) do
    with %User{id: user_id} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, game_uuid} <- parse_uuid(game_id),
         game <- Games.get_game!(game_uuid),
         :ok <- Games.leave_game(game, user_id) do
      # Broadcast to game channel that player left
      CodincodApiWeb.Endpoint.broadcast(
        "game:#{game_id}",
        "player_left",
        %{userId: user_id}
      )

      conn
      |> put_status(:ok)
      |> json(%{message: "Left game successfully"})
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid game ID"})
    end
  rescue
    Ecto.NoResultsError ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "Game not found"})
  end

  operation(:start,
    summary: "Start a game (host only)",
    parameters: [
      id: [
        in: :path,
        description: "Game identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"Game started", "application/json", Schemas.Games.GameResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Not game host", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Game not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def start(conn, %{"id" => game_id}) do
    with %User{id: user_id} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, game_uuid} <- parse_uuid(game_id),
         game <- Games.get_game!(game_uuid, preload: [:owner, :puzzle, players: :user]),
         :ok <- validate_is_host(game, user_id),
         {:ok, _updated_game} <-
           Games.transition_game(game, "in_progress", %{started_at: DateTime.utc_now()}) do
      # Reload to get associations
      game_with_assocs = Games.get_game!(game_uuid, preload: [:owner, :puzzle, players: :user])

      # Broadcast game start
      CodincodApiWeb.Endpoint.broadcast(
        "game:#{game_id}",
        "game_started",
        serialize_game(game_with_assocs)
      )

      conn
      |> put_status(:ok)
      |> json(serialize_game(game_with_assocs))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid game ID"})

      {:error, :not_host} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Only the host can start the game"})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Failed to start game", details: translate_errors(changeset)})
    end
  rescue
    Ecto.NoResultsError ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "Game not found"})
  end

  operation(:submit_code,
    summary: "Submit code for a game",
    description: "Links an existing submission to a game, marking it as a player's game submission.",
    parameters: [
      id: [
        in: :path,
        description: "Game identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    request_body: {"Game submission", "application/json", Schemas.Games.GameSubmitCodeRequest},
    responses: %{
      200 => {"Submission linked to game", "application/json", Schemas.Games.SubmitCodeResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Not a game participant", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Game or submission not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def submit_code(conn, %{"id" => game_id, "submissionId" => submission_id}) do
    alias CodincodApi.Submissions

    with %User{id: user_id} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, game_uuid} <- parse_uuid(game_id),
         {:ok, submission_uuid} <- parse_uuid(submission_id),
         game <- Games.get_game!(game_uuid, preload: [:players]),
         :ok <- validate_is_participant(game, user_id),
         {:ok, submission} <- Submissions.get_submission(submission_uuid),
         :ok <- validate_submission_owner(submission, user_id),
         {:ok, updated_submission} <-
           Submissions.link_to_game(submission, game_uuid) do
      # Broadcast to game channel
      CodincodApiWeb.Endpoint.broadcast(
        "game:#{game_id}",
        "player_submitted",
        %{
          userId: user_id,
          submissionId: submission_id,
          gameId: game_id
        }
      )

      conn
      |> put_status(:ok)
      |> json(%{
        message: "Submission linked to game",
        submissionId: updated_submission.id,
        gameId: game_id
      })
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid game or submission ID"})

      {:error, :not_participant} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "You are not a participant in this game"})

      {:error, :not_owner} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "You can only submit your own code"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Submission not found"})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Failed to link submission", details: translate_errors(changeset)})
    end
  rescue
    Ecto.NoResultsError ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "Game not found"})
  end

  ## Private functions

  defp normalize_create_params(params, user_id) when is_map(params) do
    with {:ok, puzzle_id} <- get_and_parse_uuid(params, "puzzleId") do
      # Map frontend fields to actual schema fields
      mode = Map.get(params, "gameMode", "FASTEST")
      visibility = Map.get(params, "visibility", "public")
      max_duration = Map.get(params, "timeLimit", 600)

      {:ok,
       %{
         owner_id: user_id,
         puzzle_id: puzzle_id,
         mode: mode,
         visibility: visibility,
         max_duration_seconds: max_duration,
         status: "waiting"
       }}
    else
      _ -> {:error, :invalid_payload}
    end
  end

  defp validate_can_join(%Game{status: status}, _user_id) when status != "waiting" do
    {:error, :game_started}
  end

  defp validate_can_join(%Game{players: players}, user_id) do
    cond do
      Enum.any?(players, fn p -> p.user_id == user_id end) ->
        {:error, :already_joined}

      true ->
        :ok
    end
  end

  defp validate_is_host(%Game{owner_id: owner_id}, user_id) do
    if owner_id == user_id do
      :ok
    else
      {:error, :not_host}
    end
  end

  defp validate_is_participant(%Game{players: players}, user_id) do
    if Enum.any?(players, fn p -> p.user_id == user_id end) do
      :ok
    else
      {:error, :not_participant}
    end
  end

  defp validate_submission_owner(%{user_id: submission_user_id}, user_id) do
    if submission_user_id == user_id do
      :ok
    else
      {:error, :not_owner}
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
      owner:
        game.owner &&
          %{
            id: game.owner.id,
            username: game.owner.username
          },
      puzzle:
        game.puzzle &&
          %{
            id: game.puzzle.id,
            title: game.puzzle.title,
            difficulty: game.puzzle.difficulty
          },
      players:
        Enum.map(game.players || [], fn player ->
          %{
            id: player.user.id,
            username: player.user.username,
            role: player.role,
            joinedAt: player.joined_at
          }
        end),
      createdAt: game.inserted_at,
      startedAt: game.started_at,
      endedAt: game.ended_at
    }
  end

  defp get_and_parse_uuid(params, key) do
    case Map.get(params, key) do
      nil -> {:error, :missing_field}
      value -> parse_uuid(value)
    end
  end

  defp parse_uuid(value) when is_binary(value) do
    case Ecto.UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, :invalid_uuid}
    end
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
