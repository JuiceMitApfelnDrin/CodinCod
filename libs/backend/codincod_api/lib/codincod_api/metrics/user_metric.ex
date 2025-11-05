defmodule CodincodApi.Metrics.UserMetric do
  @moduledoc """
  Aggregated rating information for a user across all multiplayer modes.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "user_metrics" do
    field :legacy_id, :string
    field :global_rating, :float, default: 1_500.0
    field :global_rating_deviation, :float, default: 350.0
    field :global_rating_volatility, :float, default: 0.06
    field :modes, :map, default: %{}
    field :totals, :map, default: %{}
    field :last_processed_game_at, :utc_datetime_usec
    field :last_calculated_at, :utc_datetime_usec

    belongs_to :user, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Statistics for a user's performance across game modes."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          global_rating: float(),
          global_rating_deviation: float(),
          global_rating_volatility: float(),
          modes: map(),
          totals: map(),
          last_processed_game_at: DateTime.t() | nil,
          last_calculated_at: DateTime.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(metric, attrs) do
    metric
    |> cast(attrs, [
      :legacy_id,
      :global_rating,
      :global_rating_deviation,
      :global_rating_volatility,
      :modes,
      :totals,
      :last_processed_game_at,
      :last_calculated_at,
      :user_id
    ])
    |> validate_required([:user_id])
    |> normalize_maps([:modes, :totals])
  end

  defp normalize_maps(changeset, fields) do
    Enum.reduce(fields, changeset, fn field, acc ->
      update_change(acc, field, fn
        nil -> %{}
        value when is_map(value) -> value
        _ -> %{}
      end)
    end)
  end
end
