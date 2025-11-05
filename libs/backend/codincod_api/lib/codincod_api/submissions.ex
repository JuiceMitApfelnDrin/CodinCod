defmodule CodincodApi.Submissions do
  @moduledoc """
  Submissions context providing persistence and query helpers for code submissions.
  Mirrors the behaviour of `libs/backend/src/services/submission.service.ts`.
  """

  import Ecto.Query, warn: false
  alias CodincodApi.Repo

  alias CodincodApi.Submissions.Submission

  @type submission_params :: map()

  @spec get_submission(Ecto.UUID.t(), keyword()) :: Submission.t() | nil
  def get_submission(id, opts \\ []) do
    Submission
    |> Repo.get(id)
    |> maybe_preload(opts)
  end

  @spec get_submission!(Ecto.UUID.t()) :: Submission.t()
  def get_submission!(id), do: Repo.get!(Submission, id)

  @spec fetch_submission(Ecto.UUID.t(), keyword()) :: {:ok, Submission.t()} | {:error, :not_found}
  def fetch_submission(id, opts \\ []) do
    case get_submission(id, opts) do
      nil -> {:error, :not_found}
      submission -> {:ok, submission}
    end
  end

  @spec list_by_user(Ecto.UUID.t(), keyword()) :: [Submission.t()]
  def list_by_user(user_id, opts \\ []) do
    Submission
    |> where([s], s.user_id == ^user_id)
    |> order_by([s], desc: s.inserted_at)
    |> maybe_limit(opts)
    |> preload([:puzzle, :programming_language, :game])
    |> Repo.all()
  end

  @spec list_by_puzzle(Ecto.UUID.t()) :: [Submission.t()]
  def list_by_puzzle(puzzle_id) do
    Submission
    |> where([s], s.puzzle_id == ^puzzle_id)
    |> order_by([s], desc: s.inserted_at)
    |> preload([:user, :programming_language])
    |> Repo.all()
  end

  @spec create_submission(submission_params()) ::
          {:ok, Submission.t()} | {:error, Ecto.Changeset.t()}
  def create_submission(attrs) do
    %Submission{}
    |> Submission.create_changeset(attrs)
    |> Repo.insert()
  end

  @spec update_result(Submission.t(), map()) ::
          {:ok, Submission.t()} | {:error, Ecto.Changeset.t()}
  def update_result(%Submission{} = submission, attrs) do
    submission
    |> Submission.update_result_changeset(attrs)
    |> Repo.update()
  end

  @spec link_to_game(Submission.t(), Ecto.UUID.t()) ::
          {:ok, Submission.t()} | {:error, Ecto.Changeset.t()}
  def link_to_game(%Submission{} = submission, game_id) do
    submission
    |> Ecto.Changeset.change(%{game_id: game_id})
    |> Repo.update()
  end

  @spec delete_submissions([Ecto.UUID.t()]) :: {non_neg_integer(), nil}
  def delete_submissions(ids) when is_list(ids) do
    Repo.delete_all(from s in Submission, where: s.id in ^ids)
  end

  defp maybe_preload(nil, _opts), do: nil

  defp maybe_preload(submission, opts) do
    case Keyword.get(opts, :preload) do
      nil -> submission
      preloads -> Repo.preload(submission, preloads)
    end
  end

  defp maybe_limit(query, opts) do
    case Keyword.get(opts, :limit) do
      nil -> query
      limit when is_integer(limit) and limit > 0 -> limit(query, ^limit)
      _ -> query
    end
  end
end
