defmodule CodinCod.Repo.Migrations.AddAuthorToPuzzles do
  alias Hex.API.User
  use Ecto.Migration

  def change do
    alter table(:puzzles) do
      add(:author, references(:user))
    end
  end
end
