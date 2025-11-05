defmodule CodincodApiWeb.Serializers.SubmissionSerializer do
  @moduledoc """
  Serializes `CodincodApi.Submissions.Submission` structs for HTTP responses.
  """

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Submissions.Submission
  alias CodincodApi.Languages.ProgrammingLanguage
  alias CodincodApiWeb.Serializers.Helpers
  alias CodincodApiWeb.Serializers.UserSerializer

  @spec render(Submission.t()) :: map()
  def render(%Submission{} = submission) do
    %{
      _id: submission.id,
      id: submission.id,
      legacyId: submission.legacy_id,
      code: submission.code,
      result: submission.result || %{},
      score: submission.score,
      createdAt: Helpers.format_datetime(submission.inserted_at),
      updatedAt: Helpers.format_datetime(submission.updated_at),
      puzzle: render_puzzle(submission.puzzle, submission.puzzle_id),
      programmingLanguage:
        render_programming_language(
          submission.programming_language,
          submission.programming_language_id
        ),
      user: render_user(submission.user, submission.user_id),
      gameId: submission.game_id,
      legacyGameSubmissionId: submission.legacy_game_submission_id
    }
  end

  @spec render_many([Submission.t()]) :: [map()]
  def render_many(submissions) when is_list(submissions) do
    Enum.map(submissions, &render/1)
  end

  defp render_user(%User{} = user, _id), do: UserSerializer.render(user)
  defp render_user(_user, nil), do: nil

  defp render_user(_user, id) do
    %{
      _id: id,
      id: id
    }
  end

  defp render_puzzle(%Puzzle{} = puzzle, _id) do
    %{
      _id: puzzle.id,
      id: puzzle.id,
      title: puzzle.title
    }
  end

  defp render_puzzle(_puzzle, nil), do: nil

  defp render_puzzle(_puzzle, id) do
    %{
      _id: id,
      id: id
    }
  end

  defp render_programming_language(%ProgrammingLanguage{} = language, _id) do
    %{
      _id: language.id,
      id: language.id,
      language: language.language,
      version: language.version,
      runtime: language.runtime
    }
  end

  defp render_programming_language(_language, nil), do: nil

  defp render_programming_language(_language, id) do
    %{
      _id: id,
      id: id
    }
  end
end
