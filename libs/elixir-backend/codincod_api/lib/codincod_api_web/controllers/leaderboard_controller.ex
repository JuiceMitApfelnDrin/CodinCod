defmodule CodincodApiWeb.LeaderboardController do
  @moduledoc """
  Handles leaderboard and ranking queries for users across different game modes and puzzles.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import Ecto.Query
  alias CodincodApi.{Metrics, Puzzles, Repo}
  alias CodincodApi.Accounts.User
  alias CodincodApi.Metrics.UserMetric
  alias CodincodApi.Submissions.Submission
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  tags(["Leaderboard"])

  operation(:global,
    summary: "Get global leaderboard rankings",
    parameters: [
      game_mode: [
        in: :query,
        description: "Game mode filter",
        schema: %OpenApiSpex.Schema{type: :string, enum: ["standard", "timed", "ranked"]},
        required: false
      ],
      limit: [
        in: :query,
        description: "Number of entries to return (1-100)",
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 1, maximum: 100},
        required: false
      ],
      offset: [
        in: :query,
        description: "Pagination offset",
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        required: false
      ]
    ],
    responses: %{
      200 =>
        {"Leaderboard rankings", "application/json",
         Schemas.Leaderboard.GlobalLeaderboardResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def global(conn, params) do
    game_mode = Map.get(params, "game_mode", "standard")
    limit = parse_int(params["limit"], 50, 1, 100)
    offset = parse_int(params["offset"], 0, 0, 10_000)

    # Try to use cached snapshot if available
    snapshot = Metrics.latest_snapshot(game_mode)

    rankings =
      if snapshot && fresh_snapshot?(snapshot) do
        # Use cached snapshot
        snapshot.rankings
        |> Enum.slice(offset, limit)
      else
        # Compute live rankings
        compute_global_rankings(game_mode, limit, offset)
      end

    conn
    |> put_status(:ok)
    |> json(%{
      gameMode: game_mode,
      rankings: rankings,
      limit: limit,
      offset: offset,
      cachedAt: snapshot && snapshot.captured_at
    })
  end

  operation(:puzzle,
    summary: "Get puzzle-specific leaderboard",
    parameters: [
      puzzle_id: [
        in: :path,
        description: "Puzzle identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ],
      limit: [
        in: :query,
        description: "Number of entries to return (1-100)",
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 1, maximum: 100},
        required: false
      ]
    ],
    responses: %{
      200 =>
        {"Puzzle leaderboard", "application/json", Schemas.Leaderboard.PuzzleLeaderboardResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def puzzle(conn, %{"puzzle_id" => puzzle_id} = params) do
    limit = parse_int(params["limit"], 50, 1, 100)

    with {:ok, puzzle_uuid} <- parse_uuid(puzzle_id),
         {:ok, _puzzle} <- Puzzles.fetch_puzzle(puzzle_uuid) do
      rankings = compute_puzzle_rankings(puzzle_uuid, limit)

      conn
      |> put_status(:ok)
      |> json(%{
        puzzleId: puzzle_id,
        rankings: rankings,
        limit: limit
      })
    else
      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid puzzle ID format"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Puzzle not found"})
    end
  end

  ## Private functions

  defp fresh_snapshot?(snapshot) do
    # Consider snapshot fresh if less than 5 minutes old
    DateTime.diff(DateTime.utc_now(), snapshot.captured_at, :second) < 300
  end

  defp compute_global_rankings(game_mode, limit, offset) do
    UserMetric
    |> where([m], m.game_mode == ^game_mode)
    |> order_by([m], desc: m.rating, desc: m.puzzles_solved)
    |> limit(^limit)
    |> offset(^offset)
    |> join(:inner, [m], u in User, on: m.user_id == u.id)
    |> select([m, u], %{
      rank: over(row_number(), order_by: [desc: m.rating, desc: m.puzzles_solved]),
      userId: u.id,
      username: u.username,
      rating: m.rating,
      puzzlesSolved: m.puzzles_solved,
      totalSubmissions: m.total_submissions
    })
    |> Repo.all()
    |> Enum.with_index(offset + 1)
    |> Enum.map(fn {entry, idx} -> Map.put(entry, :rank, idx) end)
  end

  defp compute_puzzle_rankings(puzzle_id, limit) do
    # Get best submission per user for this puzzle
    subquery =
      from s in Submission,
        where: s.puzzle_id == ^puzzle_id and s.status == "accepted",
        group_by: s.user_id,
        select: %{
          user_id: s.user_id,
          best_time:
            min(
              fragment(
                "CAST(? ->> 'executionTime' AS INTEGER)",
                s.result
              )
            ),
          best_memory:
            min(
              fragment(
                "CAST(? ->> 'memoryUsed' AS INTEGER)",
                s.result
              )
            ),
          submitted_at: max(s.inserted_at)
        }

    from(sq in subquery(subquery),
      join: u in User,
      on: sq.user_id == u.id,
      order_by: [asc: sq.best_time, asc: sq.best_memory],
      limit: ^limit,
      select: %{
        userId: u.id,
        username: u.username,
        executionTime: sq.best_time,
        memoryUsed: sq.best_memory,
        submittedAt: sq.submitted_at
      }
    )
    |> Repo.all()
    |> Enum.with_index(1)
    |> Enum.map(fn {entry, idx} -> Map.put(entry, :rank, idx) end)
  end

  defp parse_int(nil, default, _min, _max), do: default

  defp parse_int(value, default, min, max) when is_binary(value) do
    case Integer.parse(value) do
      {int, ""} when int >= min and int <= max -> int
      _ -> default
    end
  end

  defp parse_int(value, _default, min, max)
       when is_integer(value) and value >= min and value <= max,
       do: value

  defp parse_int(_value, default, _min, _max), do: default

  defp parse_uuid(value) when is_binary(value) do
    case Ecto.UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, :invalid_uuid}
    end
  end
end
