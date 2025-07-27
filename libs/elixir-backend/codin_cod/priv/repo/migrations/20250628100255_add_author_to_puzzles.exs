defmodule CodinCod.Repo.Migrations.AddAuthorToPuzzles do
  use Ecto.Migration

  def change do
    alter table(:puzzles) do
      add(:author, references(:users))
    end
  end
end
