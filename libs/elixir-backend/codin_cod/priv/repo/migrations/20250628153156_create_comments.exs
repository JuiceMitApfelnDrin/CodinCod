defmodule CodinCod.Repo.Migrations.CreateComments do
  use Ecto.Migration

  def change do
    create table(:comments) do
      add :text, :string

      timestamps(type: :utc_datetime)
    end
  end
end
