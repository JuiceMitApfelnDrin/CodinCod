defmodule CodinCod.Repo.Migrations.CreateProgrammingLanguages do
  use Ecto.Migration

  def change do
    create table(:programming_languages, primary_key: false) do
      add(:id, :binary_id, primary_key: true, null: false)
      add(:language, :string)
      add(:version, :string)
      add(:is_available, :boolean)

      timestamps(type: :utc_datetime)
    end
  end
end
