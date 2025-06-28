defmodule CodinCod.PuzzleVote do
  use Ecto.Schema
  import Ecto.Changeset
  alias CodinCod.Accounts.User
  alias CodinCod.Puzzle

  @required_fields ~w(type)a
  @optional_fields ~w()a

  schema "puzzle_votes" do
    belongs_to :user, User
    belongs_to :puzzle, Puzzle
    field :type, Ecto.Enum, values: ~w(upvote downvote)a

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(puzzle_vote, attrs) do
    puzzle_vote
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
