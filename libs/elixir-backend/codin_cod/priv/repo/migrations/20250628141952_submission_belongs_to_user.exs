defmodule CodinCod.Repo.Migrations.SubmissionBelongsToUser do
  use Ecto.Migration

  def change do
    alter table(:submission) do
      add :user_id, references(:users)
    end
  end
end
