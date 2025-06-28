defmodule CodinCod.Repo.Migrations.AddRolesAndProfileToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:profile, :json)
      add(:role, :string)
    end
  end
end
