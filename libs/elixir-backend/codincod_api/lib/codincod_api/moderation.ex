defmodule CodincodApi.Moderation do
  @moduledoc """
  Moderation workflows for handling reports, reviews, and automated escalation hooks.
  """

  import Ecto.Query, warn: false
  alias CodincodApi.Repo

  alias CodincodApi.Moderation.{Report, ModerationReview}

  @type report_filters :: %{
          optional(:status) => String.t(),
          optional(:problem_type) => String.t(),
          optional(:reported_by_id) => Ecto.UUID.t(),
          optional(:resolved_by_id) => Ecto.UUID.t()
        }
  @type review_filters :: %{
          optional(:status) => String.t(),
          optional(:puzzle_id) => Ecto.UUID.t()
        }

  ## Reports ------------------------------------------------------------------

  @spec list_reports(report_filters(), keyword()) :: [Report.t()]
  def list_reports(filters \\ %{}, opts \\ []) do
    Report
    |> apply_report_filters(filters)
    |> order_by([r], desc: r.inserted_at)
    |> maybe_preload(opts)
    |> Repo.all()
  end

  @spec get_report!(Ecto.UUID.t(), keyword()) :: Report.t()
  def get_report!(id, opts \\ []) do
    Report
    |> maybe_preload(opts)
    |> Repo.get!(id)
  end

  @spec create_report(map(), keyword()) :: {:ok, Report.t()} | {:error, Ecto.Changeset.t()}
  def create_report(attrs, opts \\ []) do
    %Report{}
    |> Report.create_changeset(attrs)
    |> Repo.insert()
    |> maybe_preload_result(opts)
  end

  @spec resolve_report(Report.t(), map(), keyword()) ::
          {:ok, Report.t()} | {:error, Ecto.Changeset.t()}
  def resolve_report(%Report{} = report, attrs, opts \\ []) do
    report
    |> Report.resolve_changeset(attrs)
    |> Repo.update()
    |> maybe_preload_result(opts)
  end

  ## Reviews ------------------------------------------------------------------

  @spec list_reviews(review_filters(), keyword()) :: [ModerationReview.t()]
  def list_reviews(filters \\ %{}, opts \\ []) do
    ModerationReview
    |> apply_review_filters(filters)
    |> order_by([r], asc: r.inserted_at)
    |> maybe_preload(opts)
    |> Repo.all()
  end

  @spec get_review!(Ecto.UUID.t(), keyword()) :: ModerationReview.t()
  def get_review!(id, opts \\ []) do
    ModerationReview
    |> maybe_preload(opts)
    |> Repo.get!(id)
  end

  @spec queue_review(map(), keyword()) ::
          {:ok, ModerationReview.t()} | {:error, Ecto.Changeset.t()}
  def queue_review(attrs, opts \\ []) do
    %ModerationReview{}
    |> ModerationReview.create_changeset(attrs)
    |> Repo.insert()
    |> maybe_preload_result(opts)
  end

  @spec update_review(ModerationReview.t(), map(), keyword()) ::
          {:ok, ModerationReview.t()} | {:error, Ecto.Changeset.t()}
  def update_review(%ModerationReview{} = review, attrs, opts \\ []) do
    review
    |> ModerationReview.update_changeset(attrs)
    |> Repo.update()
    |> maybe_preload_result(opts)
  end

  ## Helpers ------------------------------------------------------------------

  defp apply_report_filters(query, filters) do
    Enum.reduce(filters, query, fn
      {:status, status}, acc -> where(acc, [r], r.status == ^status)
      {:problem_type, type}, acc -> where(acc, [r], r.problem_type == ^type)
      {:reported_by_id, user_id}, acc -> where(acc, [r], r.reported_by_id == ^user_id)
      {:resolved_by_id, user_id}, acc -> where(acc, [r], r.resolved_by_id == ^user_id)
      {_key, _value}, acc -> acc
    end)
  end

  defp apply_review_filters(query, filters) do
    Enum.reduce(filters, query, fn
      {:status, status}, acc -> where(acc, [r], r.status == ^status)
      {:puzzle_id, puzzle_id}, acc -> where(acc, [r], r.puzzle_id == ^puzzle_id)
      {:reviewer_id, reviewer_id}, acc -> where(acc, [r], r.reviewer_id == ^reviewer_id)
      {_key, _value}, acc -> acc
    end)
  end

  defp maybe_preload(query, opts) do
    case Keyword.get(opts, :preload) do
      nil -> query
      preloads -> preload(query, ^preloads)
    end
  end

  defp maybe_preload_result({:ok, record}, opts) do
    case Keyword.get(opts, :preload) do
      nil -> {:ok, record}
      preloads -> {:ok, Repo.preload(record, preloads)}
    end
  end

  defp maybe_preload_result(other, _opts), do: other
end
