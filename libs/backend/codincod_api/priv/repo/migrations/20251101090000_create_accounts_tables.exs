defmodule CodincodApi.Repo.Migrations.CreateAccountsTables do
  use Ecto.Migration

  def change do
    execute("CREATE EXTENSION IF NOT EXISTS citext;", "")

    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :legacy_username, :string
      add :username, :citext, null: false
      add :email, :citext, null: false
      add :password_hash, :string, null: false
      add :profile, :map, null: false, default: fragment("'{}'::jsonb")
      add :role, :string, null: false, default: "user"
      add :report_count, :integer, null: false, default: 0
      add :ban_count, :integer, null: false, default: 0
      add :legacy_current_ban_id, :string

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:users, [:username])
    create unique_index(:users, [:email])
    create index(:users, [:role])
    create index(:users, [:inserted_at])

    create table(:user_bans, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :banned_by_id, references(:users, type: :binary_id, on_delete: :nilify_all)
      add :ban_type, :string, null: false
      add :reason, :text
      add :metadata, :map, null: false, default: fragment("'{}'::jsonb")
      add :expires_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:user_bans, [:user_id])
    create index(:user_bans, [:ban_type])
    create index(:user_bans, [:expires_at])

    alter table(:users) do
      add :current_ban_id, references(:user_bans, type: :binary_id, on_delete: :nilify_all)
    end

    create index(:users, [:current_ban_id])

    create table(:user_preferences, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :preferred_language, :string
      add :theme, :string
      add :blocked_user_ids, {:array, :binary_id}, null: false, default: []
      add :editor, :map, null: false, default: fragment("'{}'::jsonb")

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:user_preferences, [:user_id])
    create index(:user_preferences, [:preferred_language])
  end
end
