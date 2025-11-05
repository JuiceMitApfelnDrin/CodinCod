defmodule CodincodApi.Repo.Migrations.CreateReportsAndChat do
  use Ecto.Migration

  def change do
    create table(:reports, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :problem_type, :string, null: false
      add :problem_reference_id, :binary_id, null: false
      add :problem_reference_snapshot, :map, null: false, default: fragment("'{}'::jsonb")

      add :reported_by_id, references(:users, type: :binary_id, on_delete: :delete_all),
        null: false

      add :resolved_by_id, references(:users, type: :binary_id, on_delete: :nilify_all)
      add :explanation, :text, null: false
      add :status, :string, null: false, default: "pending"
      add :resolution_notes, :text
      add :resolved_at, :utc_datetime_usec
      add :metadata, :map, null: false, default: fragment("'{}'::jsonb")

      timestamps(type: :utc_datetime_usec)
    end

    create index(:reports, [:problem_type])
    create index(:reports, [:status])
    create index(:reports, [:reported_by_id])
    create index(:reports, [:resolved_by_id])

    create table(:moderation_reviews, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all), null: false
      add :reviewer_id, references(:users, type: :binary_id, on_delete: :nilify_all)
      add :status, :string, null: false, default: "pending"
      add :notes, :text
      add :submitted_at, :utc_datetime_usec, null: false, default: fragment("now()")
      add :resolved_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:moderation_reviews, [:puzzle_id])
    create index(:moderation_reviews, [:status])

    create table(:chat_messages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :game_id, references(:games, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :username_snapshot, :string, null: false
      add :message, :text, null: false
      add :is_deleted, :boolean, null: false, default: false
      add :deleted_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:chat_messages, [:game_id])
    create index(:chat_messages, [:user_id])
    create index(:chat_messages, [:inserted_at])
  end
end
