defmodule CodinCod.Repo.Migrations.CreateSubmissions do
  use Ecto.Migration

  def change do
    create table(:submissions) do
      add :code, :string
      add :language, :string
      add :language_version, :string
      add :puzzle_id, references(:puzzles, on_delete: :nothing)
      add :user_id, references(:users, on_delete: :delete_all)
      add :result, :json

      timestamps(type: :utc_datetime)
    end

    create index(:submissions, [:puzzle_id])
    create index(:submissions, [:user_id])
  end
end
