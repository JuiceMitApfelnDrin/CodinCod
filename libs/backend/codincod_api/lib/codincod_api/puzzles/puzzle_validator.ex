defmodule CodincodApi.Puzzles.PuzzleValidator do
  @moduledoc """
  Represents a single validator/test-case for a puzzle.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Puzzles.Puzzle

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "puzzle_validators" do
    field :legacy_id, :string
    field :input, :string
    field :output, :string
    field :is_public, :boolean, default: false

    belongs_to :puzzle, Puzzle

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Test cases executed to verify puzzle solutions."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          input: String.t() | nil,
          output: String.t() | nil,
          is_public: boolean() | nil,
          puzzle_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(validator, attrs) do
    validator
    |> cast(attrs, [:legacy_id, :input, :output, :is_public, :puzzle_id])
    |> validate_required([:input, :output, :puzzle_id])
  end
end
