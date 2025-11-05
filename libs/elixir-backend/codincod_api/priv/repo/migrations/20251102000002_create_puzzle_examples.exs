defmodule CodincodApi.Repo.Migrations.CreatePuzzleExamples do
  use Ecto.Migration

  def change do
    create table(:puzzle_examples, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all), null: false

      add :input, :text, null: false
      add :output, :text, null: false
      add :explanation, :text
      add :order, :integer, null: false
      add :metadata, :map, default: %{}, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:puzzle_examples, [:puzzle_id])
    create index(:puzzle_examples, [:puzzle_id, :order])
    create unique_index(:puzzle_examples, [:legacy_id], where: "legacy_id IS NOT NULL")
  end
end
