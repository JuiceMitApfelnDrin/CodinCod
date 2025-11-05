defmodule CodincodApi.Metrics do
  @moduledoc """
  Centralises leaderboard statistics, ratings and cached leaderboard snapshots.
  """

  import Ecto.Query, warn: false
  alias CodincodApi.Repo

  alias CodincodApi.Metrics.{UserMetric, LeaderboardSnapshot}

  ## User metrics --------------------------------------------------------------

  @spec get_user_metric(Ecto.UUID.t()) :: UserMetric.t() | nil
  def get_user_metric(user_id) do
    Repo.get_by(UserMetric, user_id: user_id)
  end

  @spec get_user_metric!(Ecto.UUID.t()) :: UserMetric.t()
  def get_user_metric!(user_id) do
    Repo.get_by!(UserMetric, user_id: user_id)
  end

  @spec upsert_user_metric(map()) :: {:ok, UserMetric.t()} | {:error, Ecto.Changeset.t()}
  def upsert_user_metric(attrs) do
    %UserMetric{}
    |> UserMetric.changeset(attrs)
    |> Repo.insert(
      conflict_target: [:user_id],
      on_conflict: {:replace_all_except, [:id, :inserted_at, :user_id]}
    )
  end

  @spec update_user_metric(UserMetric.t(), map()) ::
          {:ok, UserMetric.t()} | {:error, Ecto.Changeset.t()}
  def update_user_metric(%UserMetric{} = metric, attrs) do
    metric
    |> UserMetric.changeset(attrs)
    |> Repo.update()
  end

  ## Leaderboard snapshots -----------------------------------------------------

  @spec list_snapshots(keyword()) :: [LeaderboardSnapshot.t()]
  def list_snapshots(opts \\ []) do
    LeaderboardSnapshot
    |> maybe_filter_snapshots(opts)
    |> order_by([s], desc: s.captured_at)
    |> maybe_limit(opts)
    |> Repo.all()
  end

  @spec latest_snapshot(String.t()) :: LeaderboardSnapshot.t() | nil
  def latest_snapshot(game_mode) do
    LeaderboardSnapshot
    |> where([s], s.game_mode == ^game_mode)
    |> order_by([s], desc: s.captured_at)
    |> limit(1)
    |> Repo.one()
  end

  @spec record_snapshot(map()) :: {:ok, LeaderboardSnapshot.t()} | {:error, Ecto.Changeset.t()}
  def record_snapshot(attrs) do
    %LeaderboardSnapshot{}
    |> LeaderboardSnapshot.changeset(attrs)
    |> Repo.insert()
  end

  ## Helpers ------------------------------------------------------------------

  defp maybe_filter_snapshots(query, opts) do
    Enum.reduce(opts, query, fn
      {:game_mode, mode}, acc when is_binary(mode) -> where(acc, [s], s.game_mode == ^mode)
      {:captured_after, %DateTime{} = dt}, acc -> where(acc, [s], s.captured_at >= ^dt)
      {:captured_before, %DateTime{} = dt}, acc -> where(acc, [s], s.captured_at <= ^dt)
      {_key, _value}, acc -> acc
    end)
  end

  defp maybe_limit(query, opts) do
    case Keyword.get(opts, :limit) do
      nil -> query
      limit when is_integer(limit) and limit > 0 -> limit(query, ^limit)
      _ -> query
    end
  end
end
