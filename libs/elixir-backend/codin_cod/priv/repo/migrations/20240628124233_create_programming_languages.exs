defmodule CodinCod.Repo.Migrations.CreateProgrammingLanguages do
  use Ecto.Migration

  def change do
    create table(:programming_languages) do
      add :language, :string
      add :version, :string
      add :is_available, :boolean

      timestamps(type: :utc_datetime)
    end
  end
end
