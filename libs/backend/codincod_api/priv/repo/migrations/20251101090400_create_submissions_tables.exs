defmodule CodincodApi.Repo.Migrations.CreateSubmissionsTables do
  use Ecto.Migration

  def change do
    create table(:submissions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false

      add :programming_language_id,
          references(:programming_languages, type: :binary_id, on_delete: :restrict),
          null: false

      add :code, :text, null: false
      add :result, :map, null: false, default: fragment("'{}'::jsonb")
      add :score, :float
      add :legacy_game_submission_id, :string

      timestamps(type: :utc_datetime_usec)
    end

    create index(:submissions, [:puzzle_id])
    create index(:submissions, [:user_id])
    create index(:submissions, [:inserted_at])
  end
end
