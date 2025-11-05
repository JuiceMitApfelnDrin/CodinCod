defmodule CodincodApi.Repo.Migrations.CreatePuzzlesTables do
  use Ecto.Migration

  def change do
    execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;", "")
    execute("CREATE EXTENSION IF NOT EXISTS btree_gin;", "")

    create table(:puzzles, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :title, :string, null: false
      add :statement, :text
      add :constraints, :text
      add :author_id, references(:users, type: :binary_id, on_delete: :nothing), null: false
      add :difficulty, :string, null: false
      add :visibility, :string, null: false
      add :tags, {:array, :string}, null: false, default: []
      add :solution, :map, null: false, default: fragment("'{}'::jsonb")
      add :moderation_feedback, :text
      add :legacy_metrics_id, :string
      add :legacy_comments, {:array, :string}, null: false, default: []

      timestamps(type: :utc_datetime_usec)
    end

    create index(:puzzles, [:author_id])
    create index(:puzzles, [:difficulty])
    create index(:puzzles, [:visibility])
    create index(:puzzles, [:inserted_at])

    execute(
      "CREATE INDEX puzzles_tags_gin_index ON puzzles USING gin (tags);",
      "DROP INDEX IF EXISTS puzzles_tags_gin_index;"
    )

    create table(:puzzle_validators, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all), null: false
      add :legacy_id, :string
      add :input, :text, null: false
      add :output, :text, null: false
      add :is_public, :boolean, null: false, default: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:puzzle_validators, [:puzzle_id])
    create index(:puzzle_validators, [:is_public])

    create table(:puzzle_metrics, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all), null: false
      add :legacy_id, :string
      add :attempt_count, :integer, null: false, default: 0
      add :success_count, :integer, null: false, default: 0
      add :average_execution_ms, :float, null: false, default: 0.0
      add :average_code_length, :integer, null: false, default: 0

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:puzzle_metrics, [:puzzle_id])
  end
end
