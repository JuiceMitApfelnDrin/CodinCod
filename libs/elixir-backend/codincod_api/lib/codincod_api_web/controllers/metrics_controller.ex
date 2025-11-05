defmodule CodincodApiWeb.MetricsController do
  @moduledoc """
  Provides platform-wide metrics, user statistics, and puzzle analytics.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import Ecto.Query
  alias CodincodApi.{Accounts, Puzzles, Repo}
  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Submissions.Submission
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  tags(["Metrics"])

  operation(:platform,
    summary: "Get platform-wide statistics",
    responses: %{
      200 => {"Platform metrics", "application/json", Schemas.Metrics.PlatformMetricsResponse}
    }
  )

  def platform(conn, _params) do
    metrics = %{
      totalUsers: Repo.aggregate(User, :count),
      totalPuzzles: Repo.aggregate(from(p in Puzzle, where: p.is_published == true), :count),
      totalSubmissions: Repo.aggregate(Submission, :count),
      acceptedSubmissions:
        Repo.aggregate(from(s in Submission, where: s.status == "accepted"), :count),
      activeUsers: count_active_users(7),
      # Active in last 7 days
      popularPuzzles: get_popular_puzzles(5)
    }

    conn
    |> put_status(:ok)
    |> json(metrics)
  end

  operation(:user_stats,
    summary: "Get detailed statistics for a user",
    parameters: [
      user_id: [
        in: :path,
        description: "User identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"User statistics", "application/json", Schemas.Metrics.UserStatsResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      404 => {"User not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def user_stats(conn, %{"user_id" => user_id}) do
    with {:ok, user_uuid} <- parse_uuid(user_id),
         {:ok, user} <- Accounts.fetch_user(user_uuid) do
      stats = compute_user_stats(user_uuid)

      conn
      |> put_status(:ok)
      |> json(
        Map.merge(stats, %{
          userId: user.id,
          username: user.username
        })
      )
    else
      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid user ID format"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "User not found"})
    end
  end

  operation(:puzzle_stats,
    summary: "Get detailed statistics for a puzzle",
    parameters: [
      puzzle_id: [
        in: :path,
        description: "Puzzle identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"Puzzle statistics", "application/json", Schemas.Metrics.PuzzleStatsResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def puzzle_stats(conn, %{"puzzle_id" => puzzle_id}) do
    with {:ok, puzzle_uuid} <- parse_uuid(puzzle_id),
         {:ok, puzzle} <- Puzzles.fetch_puzzle(puzzle_uuid) do
      stats = compute_puzzle_stats(puzzle_uuid)

      conn
      |> put_status(:ok)
      |> json(
        Map.merge(stats, %{
          puzzleId: puzzle.id,
          title: puzzle.title
        })
      )
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

  defp count_active_users(days) do
    cutoff = DateTime.utc_now() |> DateTime.add(-days * 24 * 60 * 60, :second)

    Submission
    |> where([s], s.inserted_at >= ^cutoff)
    |> select([s], s.user_id)
    |> distinct(true)
    |> Repo.aggregate(:count)
  end

  defp get_popular_puzzles(limit) do
    # Get puzzles with most submissions in last 30 days
    cutoff = DateTime.utc_now() |> DateTime.add(-30 * 24 * 60 * 60, :second)

    from(s in Submission,
      where: s.inserted_at >= ^cutoff,
      group_by: s.puzzle_id,
      join: p in Puzzle,
      on: s.puzzle_id == p.id,
      select: %{
        puzzleId: p.id,
        title: p.title,
        difficulty: p.difficulty,
        submissionCount: count(s.id)
      },
      order_by: [desc: count(s.id)],
      limit: ^limit
    )
    |> Repo.all()
  end

  defp compute_user_stats(user_id) do
    # Get submission stats
    submission_stats =
      from(s in Submission,
        where: s.user_id == ^user_id,
        select: %{
          total: count(s.id),
          accepted: filter(count(s.id), s.status == "accepted"),
          wrong_answer: filter(count(s.id), s.status == "wrong_answer"),
          time_limit: filter(count(s.id), s.status == "time_limit_exceeded"),
          runtime_error: filter(count(s.id), s.status == "runtime_error")
        }
      )
      |> Repo.one()

    # Get unique puzzles solved
    puzzles_solved =
      from(s in Submission,
        where: s.user_id == ^user_id and s.status == "accepted",
        select: s.puzzle_id,
        distinct: true
      )
      |> Repo.aggregate(:count)

    # Get difficulty breakdown
    difficulty_breakdown =
      from(s in Submission,
        where: s.user_id == ^user_id and s.status == "accepted",
        join: p in Puzzle,
        on: s.puzzle_id == p.id,
        group_by: p.difficulty,
        select: {p.difficulty, count(s.id)},
        distinct: [s.puzzle_id, p.difficulty]
      )
      |> Repo.all()
      |> Enum.into(%{})

    # Get language usage
    language_usage =
      from(s in Submission,
        where: s.user_id == ^user_id,
        join: pl in assoc(s, :programming_language),
        group_by: pl.name,
        select: %{
          language: pl.name,
          count: count(s.id)
        },
        order_by: [desc: count(s.id)],
        limit: 10
      )
      |> Repo.all()

    # Get recent activity (last 30 days)
    cutoff = DateTime.utc_now() |> DateTime.add(-30 * 24 * 60 * 60, :second)

    recent_submissions =
      Submission
      |> where([s], s.user_id == ^user_id and s.inserted_at >= ^cutoff)
      |> Repo.aggregate(:count)

    %{
      totalSubmissions: submission_stats.total,
      acceptedSubmissions: submission_stats.accepted,
      wrongAnswerSubmissions: submission_stats.wrong_answer,
      timeLimitExceeded: submission_stats.time_limit,
      runtimeErrors: submission_stats.runtime_error,
      puzzlesSolved: puzzles_solved,
      acceptanceRate:
        if(submission_stats.total > 0,
          do: Float.round(submission_stats.accepted / submission_stats.total * 100, 2),
          else: 0.0
        ),
      difficultyBreakdown: %{
        easy: Map.get(difficulty_breakdown, "easy", 0),
        medium: Map.get(difficulty_breakdown, "medium", 0),
        hard: Map.get(difficulty_breakdown, "hard", 0),
        expert: Map.get(difficulty_breakdown, "expert", 0)
      },
      languageUsage: language_usage,
      recentActivity: recent_submissions
    }
  end

  defp compute_puzzle_stats(puzzle_id) do
    # Get submission stats
    submission_stats =
      from(s in Submission,
        where: s.puzzle_id == ^puzzle_id,
        select: %{
          total: count(s.id),
          accepted: filter(count(s.id), s.status == "accepted"),
          wrong_answer: filter(count(s.id), s.status == "wrong_answer"),
          time_limit: filter(count(s.id), s.status == "time_limit_exceeded"),
          runtime_error: filter(count(s.id), s.status == "runtime_error")
        }
      )
      |> Repo.one()

    # Get unique solvers
    unique_solvers =
      from(s in Submission,
        where: s.puzzle_id == ^puzzle_id and s.status == "accepted",
        select: s.user_id,
        distinct: true
      )
      |> Repo.aggregate(:count)

    # Get average execution time for accepted submissions
    avg_execution_time =
      from(s in Submission,
        where: s.puzzle_id == ^puzzle_id and s.status == "accepted",
        select:
          avg(
            fragment(
              "CAST(? ->> 'executionTime' AS INTEGER)",
              s.result
            )
          )
      )
      |> Repo.one()

    # Get language distribution
    language_distribution =
      from(s in Submission,
        where: s.puzzle_id == ^puzzle_id and s.status == "accepted",
        join: pl in assoc(s, :programming_language),
        group_by: pl.name,
        select: %{
          language: pl.name,
          count: count(s.id)
        },
        order_by: [desc: count(s.id)]
      )
      |> Repo.all()

    %{
      totalSubmissions: submission_stats.total,
      acceptedSubmissions: submission_stats.accepted,
      uniqueSolvers: unique_solvers,
      acceptanceRate:
        if(submission_stats.total > 0,
          do: Float.round(submission_stats.accepted / submission_stats.total * 100, 2),
          else: 0.0
        ),
      averageExecutionTime: avg_execution_time && Float.round(avg_execution_time, 2),
      languageDistribution: language_distribution,
      statusBreakdown: %{
        accepted: submission_stats.accepted,
        wrongAnswer: submission_stats.wrong_answer,
        timeLimitExceeded: submission_stats.time_limit,
        runtimeError: submission_stats.runtime_error
      }
    }
  end

  defp parse_uuid(value) when is_binary(value) do
    case Ecto.UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, :invalid_uuid}
    end
  end
end
