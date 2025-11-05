defmodule CodincodApi.Puzzles.PuzzleMetric do
  @moduledoc """
  Aggregated statistics for a puzzle used by leaderboards and filtering.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Puzzles.Puzzle

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "puzzle_metrics" do
    field :legacy_id, :string
    field :attempt_count, :integer, default: 0
    field :success_count, :integer, default: 0
    field :average_execution_ms, :float, default: 0.0
    field :average_code_length, :integer, default: 0

    belongs_to :puzzle, Puzzle

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Rolled-up statistics for puzzle performance insights."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          attempt_count: non_neg_integer() | nil,
          success_count: non_neg_integer() | nil,
          average_execution_ms: float() | nil,
          average_code_length: integer() | nil,
          puzzle_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(metric, attrs) do
    metric
    |> cast(attrs, [
      :legacy_id,
      :attempt_count,
      :success_count,
      :average_execution_ms,
      :average_code_length,
      :puzzle_id
    ])
    |> validate_required([:puzzle_id])
  end
end
