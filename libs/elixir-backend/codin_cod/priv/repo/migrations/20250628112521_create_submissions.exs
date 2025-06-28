defmodule CodinCod.Repo.Migrations.CreateSubmissions do
  use Ecto.Migration

  def change do
    create table(:submissions) do
      add :code, :string
      add :language, :string
      add :language_version, :string
      add :result, :string
      add :puzzle, references(:puzzles, on_delete: :nothing)
      add :author, references(:users, on_delete: :delete_all)
      add :result, :json

      timestamps(type: :utc_datetime)
    end

    create index(:submissions, [:puzzle])
    create index(:submissions, [:author])
  end
end
