defmodule CodincodApi.Repo.Migrations.CreateMetricsTables do
  use Ecto.Migration

  def change do
    create table(:user_metrics, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :global_rating, :float, null: false, default: 1500.0
      add :global_rating_deviation, :float, null: false, default: 350.0
      add :global_rating_volatility, :float, null: false, default: 0.06
      add :modes, :map, null: false, default: fragment("'{}'::jsonb")
      add :totals, :map, null: false, default: fragment("'{}'::jsonb")
      add :last_processed_game_at, :utc_datetime_usec
      add :last_calculated_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:user_metrics, [:user_id])
    create index(:user_metrics, [:global_rating])

    create table(:leaderboard_snapshots, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :game_mode, :string, null: false
      add :captured_at, :utc_datetime_usec, null: false
      add :entries, :map, null: false, default: fragment("'[]'::jsonb")
      add :metadata, :map, null: false, default: fragment("'{}'::jsonb")

      timestamps(type: :utc_datetime_usec)
    end

    create index(:leaderboard_snapshots, [:game_mode])
    create index(:leaderboard_snapshots, [:captured_at])
  end
end
