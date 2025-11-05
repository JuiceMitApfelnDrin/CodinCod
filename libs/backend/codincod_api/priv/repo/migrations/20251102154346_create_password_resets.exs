defmodule CodincodApi.Repo.Migrations.CreatePasswordResets do
  use Ecto.Migration

  def change do
    create table(:password_resets, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :token, :string, null: false
      add :expires_at, :utc_datetime_usec, null: false
      add :used_at, :utc_datetime_usec
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:password_resets, [:token])
    create index(:password_resets, [:user_id])
    create index(:password_resets, [:expires_at])
  end
end
