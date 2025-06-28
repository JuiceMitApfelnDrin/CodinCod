defmodule CodinCod.Repo.Migrations.CreatePuzzles do
  use Ecto.Migration

  def change do
    create table(:puzzles) do
      add(:title, :string)
      add(:statement, :string)
      add(:constraints, :string)
      add(:visibility, :string)
      add(:difficulty, :string)
      add(:tags, {:array, :string})

      timestamps(type: :utc_datetime)
    end
  end
end
