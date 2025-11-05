defmodule CodincodApi.Puzzles.PuzzleTestCase do
  @moduledoc """
  Test case schema for puzzle validation.
  Each puzzle can have multiple test cases that validate submitted solutions.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Puzzles.Puzzle

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "puzzle_test_cases" do
    field :legacy_id, :string
    field :input, :string
    field :expected_output, :string
    field :is_sample, :boolean, default: false
    field :order, :integer
    field :metadata, :map, default: %{}

    belongs_to :puzzle, Puzzle

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Test case for validating puzzle solutions."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          input: String.t() | nil,
          expected_output: String.t() | nil,
          is_sample: boolean(),
          order: integer() | nil,
          metadata: map(),
          puzzle_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @doc """
  Changeset for creating or updating test cases.
  """
  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(test_case, attrs) do
    test_case
    |> cast(attrs, [
      :legacy_id,
      :puzzle_id,
      :input,
      :expected_output,
      :is_sample,
      :order,
      :metadata
    ])
    |> validate_required([:puzzle_id, :input, :expected_output, :order])
    |> validate_number(:order, greater_than_or_equal_to: 0)
    |> foreign_key_constraint(:puzzle_id)
    |> unique_constraint(:legacy_id)
  end
end
