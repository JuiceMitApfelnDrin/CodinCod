defmodule CodinCod.Repo.Migrations.CreateGames do
  use Ecto.Migration

  def change do
    create table(:games) do
      add :puzzle, references(:puzzles, on_delete: :nothing)
      add :owner, references(:users, on_delete: :nothing)

      add :start_time, :naive_datetime


      timestamps(type: :utc_datetime)
    end

    create index(:games, [:puzzle])
    create index(:games, [:owner])

    create table(:games_players) do
      add :game_id, references(:games)
      add :user_id, references(:users)
    end

    create unique_index(:games_players, [:game_id, :user_id])
  end
end
