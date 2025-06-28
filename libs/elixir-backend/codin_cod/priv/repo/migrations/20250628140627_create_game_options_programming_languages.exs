defmodule CodinCod.Repo.Migrations.CreateGameOptionsProgrammingLanguages do
  use Ecto.Migration

  def change do
    create table(:game_options_programming_languages) do
      add :game_id, references(:game_options)
      add :programming_language_id, references(:programming_languages)
    end

    create unique_index(:game_options_programming_languages, [:game_id, :programming_language_id])
  end
end
