defmodule CodinCod.Puzzle do
  use Ecto.Schema
  import Ecto.Changeset
  alias CodinCod.Accounts.User

  schema "puzzles" do
    belongs_to(:user, User)

    field(:title, :string)
    field(:constraints, :string)
    field(:statement, :string)
    field(:difficulty, Ecto.Enum, values: ~w(beginner intermediate advanced expert)a)

    field(:visibility, Ecto.Enum,
      values: ~w(draft ready review revise approved inactive archived)a
    )

    field(:tags, {:array, Ecto.Enum},
      values:
        ~w(algorithms data_structures mathematics strings arrays math graph_theory dynamic_programming)a
    )

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(puzzle, attrs) do
    puzzle
    |> cast(attrs, [:title, :statement, :constraints])
    |> cast_assoc(:user)
    |> assoc_constraint(:user)
    |> validate_required([:title, :statement, :constraints, :difficulty, :visibility])
  end
end
