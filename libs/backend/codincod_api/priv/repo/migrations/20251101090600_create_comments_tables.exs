defmodule CodincodApi.Repo.Migrations.CreateCommentsTables do
  use Ecto.Migration

  def change do
    create table(:comments, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :legacy_id, :string
      add :author_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :puzzle_id, references(:puzzles, type: :binary_id, on_delete: :delete_all)
      add :submission_id, references(:submissions, type: :binary_id, on_delete: :delete_all)
      add :parent_comment_id, references(:comments, type: :binary_id, on_delete: :delete_all)
      add :body, :text, null: false
      add :comment_type, :string, null: false, default: "comment"
      add :upvote_count, :integer, null: false, default: 0
      add :downvote_count, :integer, null: false, default: 0
      add :metadata, :map, null: false, default: fragment("'{}'::jsonb")
      add :deleted_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:comments, [:author_id])
    create index(:comments, [:puzzle_id])
    create index(:comments, [:submission_id])
    create index(:comments, [:parent_comment_id])
    create index(:comments, [:comment_type])

    create table(:comment_votes, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :comment_id, references(:comments, type: :binary_id, on_delete: :delete_all),
        null: false

      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :vote_type, :string, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:comment_votes, [:comment_id, :user_id])
    create index(:comment_votes, [:vote_type])
  end
end
