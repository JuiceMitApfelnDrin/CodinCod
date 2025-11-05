defmodule CodincodApi.Repo.Migrations.CreatePuzzleTestCases do
  use Ecto.Migration

  def change do
    create table(:puzzle_test_cases, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all), null: false

      add :input, :text, null: false
      add :expected_output, :text, null: false
      add :is_sample, :boolean, default: false, null: false
      add :order, :integer, null: false
      add :metadata, :map, default: %{}, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:puzzle_test_cases, [:puzzle_id])
    create index(:puzzle_test_cases, [:puzzle_id, :order])
    create index(:puzzle_test_cases, [:puzzle_id, :is_sample])
    create unique_index(:puzzle_test_cases, [:legacy_id], where: "legacy_id IS NOT NULL")
  end
end
