defmodule CodincodApi.Repo.Migrations.CreateGamesTables do
  use Ecto.Migration

  def change do
    create table(:games, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :owner_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :restrict), null: false
      add :visibility, :string, null: false
      add :mode, :string, null: false
      add :rated, :boolean, null: false, default: true
      add :status, :string, null: false, default: "waiting"
      add :max_duration_seconds, :integer, null: false, default: 600
      add :allowed_language_ids, {:array, :binary_id}, null: false, default: []
      add :options, :map, null: false, default: fragment("'{}'::jsonb")
      add :started_at, :utc_datetime_usec
      add :ended_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:games, [:owner_id])
    create index(:games, [:puzzle_id])
    create index(:games, [:status])
    create index(:games, [:mode])
    create index(:games, [:visibility])

    create table(:game_players, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :game_id, references(:games, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :joined_at, :utc_datetime_usec, null: false
      add :left_at, :utc_datetime_usec
      add :role, :string, null: false, default: "player"
      add :score, :integer
      add :placement, :integer

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:game_players, [:game_id, :user_id])
    create index(:game_players, [:role])

    alter table(:submissions) do
      add :game_id, references(:games, type: :binary_id, on_delete: :delete_all)
    end

    create index(:submissions, [:game_id])
  end
end
