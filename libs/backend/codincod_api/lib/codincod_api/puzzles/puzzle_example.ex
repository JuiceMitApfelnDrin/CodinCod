defmodule CodincodApi.Puzzles.PuzzleExample do
  @moduledoc """
  Example schema for puzzle illustrations.
  Examples help users understand puzzle requirements with sample inputs/outputs.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Puzzles.Puzzle

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "puzzle_examples" do
    field :legacy_id, :string
    field :input, :string
    field :output, :string
    field :explanation, :string
    field :order, :integer
    field :metadata, :map, default: %{}

    belongs_to :puzzle, Puzzle

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Example for illustrating puzzle behavior."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          input: String.t() | nil,
          output: String.t() | nil,
          explanation: String.t() | nil,
          order: integer() | nil,
          metadata: map(),
          puzzle_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @doc """
  Changeset for creating or updating examples.
  """
  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(example, attrs) do
    example
    |> cast(attrs, [
      :legacy_id,
      :puzzle_id,
      :input,
      :output,
      :explanation,
      :order,
      :metadata
    ])
    |> validate_required([:puzzle_id, :input, :output, :order])
    |> validate_number(:order, greater_than_or_equal_to: 0)
    |> foreign_key_constraint(:puzzle_id)
    |> unique_constraint(:legacy_id)
  end
end
