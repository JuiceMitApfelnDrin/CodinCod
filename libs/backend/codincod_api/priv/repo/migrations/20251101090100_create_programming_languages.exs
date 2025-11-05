defmodule CodincodApi.Repo.Migrations.CreateProgrammingLanguages do
  use Ecto.Migration

  def change do
    create table(:programming_languages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :language, :string, null: false
      add :version, :string, null: false
      add :aliases, {:array, :string}, null: false, default: []
      add :runtime, :string
      add :display_order, :integer
      add :is_active, :boolean, null: false, default: true

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:programming_languages, [:language, :version])
    create index(:programming_languages, [:is_active])
    create index(:programming_languages, [:display_order])
  end
end
