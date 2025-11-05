defmodule CodincodApiWeb.Serializers.PuzzleSerializer do
  @moduledoc """
  Converts `CodincodApi.Puzzles.Puzzle` structs into JSON-ready maps aligned with the
  legacy Fastify responses.
  """

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.{Puzzle, PuzzleValidator}
  alias CodincodApiWeb.Serializers.Helpers

  @spec render(Puzzle.t()) :: map()
  def render(%Puzzle{} = puzzle) do
    %{
      _id: puzzle.id,
      id: puzzle.id,
      legacyId: puzzle.legacy_id,
      title: puzzle.title,
      statement: puzzle.statement,
      constraints: puzzle.constraints,
      author: render_author(puzzle.author),
      validators: render_validators(puzzle.validators || []),
      difficulty: normalize_difficulty(puzzle.difficulty),
      visibility: normalize_visibility(puzzle.visibility),
      createdAt: Helpers.format_datetime(puzzle.inserted_at),
      updatedAt: Helpers.format_datetime(puzzle.updated_at),
      solution: normalize_solution(puzzle.solution),
      puzzleMetrics: puzzle.metrics && puzzle.metrics.id,
      legacyMetricsId: puzzle.legacy_metrics_id,
      tags: puzzle.tags || [],
      comments: puzzle.legacy_comments || [],
      moderationFeedback: puzzle.moderation_feedback
    }
  end

  @spec render_many([Puzzle.t()]) :: [map()]
  def render_many(puzzles) when is_list(puzzles) do
    Enum.map(puzzles, &render/1)
  end

  defp render_author(%User{} = user) do
    %{
      _id: user.id,
      id: user.id,
      username: user.username,
      profile: user.profile,
      role: user.role,
      createdAt: Helpers.format_datetime(user.inserted_at),
      updatedAt: Helpers.format_datetime(user.updated_at)
    }
  end

  defp render_author(_), do: nil

  defp render_validators(validators) do
    validators
    |> Enum.map(fn
      %PuzzleValidator{} = validator ->
        %{
          input: validator.input,
          output: validator.output,
          isPublic: validator.is_public,
          createdAt: Helpers.format_datetime(validator.inserted_at),
          updatedAt: Helpers.format_datetime(validator.updated_at)
        }

      _ ->
        nil
    end)
    |> Enum.reject(&is_nil/1)
  end

  defp normalize_solution(solution) when is_map(solution) do
    %{
      code:
        Helpers.coalesce(
          [Map.get(solution, "code"), Map.get(solution, :code)],
          ""
        ),
      programmingLanguage:
        Helpers.coalesce([
          Map.get(solution, "programmingLanguage"),
          Map.get(solution, :programmingLanguage),
          Map.get(solution, "programming_language"),
          Map.get(solution, :programming_language)
        ])
    }
  end

  defp normalize_solution(_), do: %{code: "", programmingLanguage: nil}

  defp normalize_difficulty(nil), do: nil

  defp normalize_difficulty(difficulty) when is_binary(difficulty) do
    difficulty
    |> String.trim()
    |> String.downcase()
  end

  defp normalize_difficulty(_), do: nil

  defp normalize_visibility(nil), do: nil

  defp normalize_visibility(visibility) when is_binary(visibility) do
    visibility
    |> String.trim()
    |> String.downcase()
  end

  defp normalize_visibility(_), do: nil
end
