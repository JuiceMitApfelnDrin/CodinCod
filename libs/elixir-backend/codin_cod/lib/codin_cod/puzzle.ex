defmodule CodinCod.Puzzle do
  use Ecto.Schema
  import Ecto.Changeset

  schema "puzzles" do
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
    |> validate_required([:title, :statement, :constraints])
  end
end
