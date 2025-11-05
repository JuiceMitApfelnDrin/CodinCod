defmodule CodincodApi.Puzzles.Puzzle do
  @moduledoc """
  Puzzle domain schema capturing authoring information, difficulty, solution metadata and
  moderation feedback.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.{Puzzle, PuzzleValidator, PuzzleMetric, PuzzleTestCase, PuzzleExample}

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "puzzles" do
    field :legacy_id, :string
    field :title, :string
    field :statement, :string
    field :constraints, :string
    field :difficulty, :string
    field :visibility, :string
    field :tags, {:array, :string}, default: []
    field :solution, :map, default: %{}  # Deprecated: being normalized to test_cases/examples
    field :moderation_feedback, :string
    field :legacy_metrics_id, :string
    field :legacy_comments, {:array, :string}, default: []

    belongs_to :author, User
    has_many :validators, PuzzleValidator
    has_many :test_cases, PuzzleTestCase
    has_many :examples, PuzzleExample
    has_one :metrics, PuzzleMetric

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Puzzle authored by users for single-player or multiplayer experiences."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          title: String.t() | nil,
          statement: String.t() | nil,
          constraints: String.t() | nil,
          difficulty: String.t() | nil,
          visibility: String.t() | nil,
          tags: [String.t()],
          solution: map(),
          moderation_feedback: String.t() | nil,
          legacy_metrics_id: String.t() | nil,
          legacy_comments: [String.t()],
          author_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @doc """
  Base changeset for puzzle authoring.
  """
  @spec changeset(Puzzle.t(), map()) :: Ecto.Changeset.t()
  def changeset(puzzle, attrs) do
    puzzle
    |> cast(attrs, [
      :legacy_id,
      :title,
      :statement,
      :constraints,
      :difficulty,
      :visibility,
      :tags,
      :solution,
      :moderation_feedback,
      :author_id
    ])
    |> validate_required([:title, :difficulty, :visibility, :author_id])
    |> validate_length(:title, min: 4, max: 128)
    |> validate_inclusion(:difficulty, [
      "BEGINNER",
      "EASY",
      "INTERMEDIATE",
      "ADVANCED",
      "HARD",
      "EXPERT"
    ])
    |> validate_inclusion(:visibility, [
      "DRAFT",
      "READY",
      "REVIEW",
      "REVISE",
      "APPROVED",
      "INACTIVE",
      "ARCHIVED"
    ])
    |> put_default_solution()
  end

  defp put_default_solution(changeset) do
    update_change(changeset, :solution, fn
      nil -> %{}
      solution when is_map(solution) -> solution
      _ -> %{}
    end)
  end
end
