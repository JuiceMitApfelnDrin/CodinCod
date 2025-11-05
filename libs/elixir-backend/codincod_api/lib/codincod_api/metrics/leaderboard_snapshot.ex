defmodule CodincodApi.Metrics.LeaderboardSnapshot do
  @moduledoc """
  Immutable snapshot of leaderboard standings for a specific game mode.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "leaderboard_snapshots" do
    field :game_mode, :string
    field :captured_at, :utc_datetime_usec
    field :entries, {:array, :map}, default: []
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Leaderboard capture for auditing or caching leaderboard responses."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          game_mode: String.t() | nil,
          captured_at: DateTime.t() | nil,
          entries: [map()],
          metadata: map(),
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(snapshot, attrs) do
    snapshot
    |> cast(attrs, [:game_mode, :captured_at, :entries, :metadata])
    |> validate_required([:game_mode])
    |> put_change(:captured_at, Map.get(attrs, :captured_at, DateTime.utc_now()))
    |> normalize_entries()
    |> normalize_metadata()
  end

  defp normalize_entries(changeset) do
    update_change(changeset, :entries, fn
      nil -> []
      value when is_list(value) -> value
      _ -> []
    end)
  end

  defp normalize_metadata(changeset) do
    update_change(changeset, :metadata, fn
      nil -> %{}
      value when is_map(value) -> value
      _ -> %{}
    end)
  end
end
