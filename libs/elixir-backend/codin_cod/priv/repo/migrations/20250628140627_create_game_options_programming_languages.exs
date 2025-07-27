defmodule CodinCod.Repo.Migrations.CreateGameOptionsProgrammingLanguages do
  use Ecto.Migration

  def change do
    create table(:game_options_programming_languages) do
      add :game_id, references(:games, on_delete: :delete_all)
      add :programming_language_id, references(:programming_languages, on_delete: :delete_all)
    end

    create unique_index(:game_options_programming_languages, [:game_id, :programming_language_id])
  end
end
