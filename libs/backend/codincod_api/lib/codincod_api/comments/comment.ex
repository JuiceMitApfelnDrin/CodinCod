defmodule CodincodApi.Comments.Comment do
  @moduledoc """
  Persistent representation of user-authored comments across puzzles and submissions.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Submissions.Submission
  alias CodincodApi.Comments.{Comment, CommentVote}

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @comment_types ["puzzle-comment", "comment-comment"]

  schema "comments" do
    field :legacy_id, :string
    field :body, :string
    field :comment_type, :string, default: "comment-comment"
    field :upvote_count, :integer, default: 0
    field :downvote_count, :integer, default: 0
    field :metadata, :map, default: %{}
    field :deleted_at, :utc_datetime_usec

    belongs_to :author, User
    belongs_to :puzzle, Puzzle
    belongs_to :submission, Submission
    belongs_to :parent_comment, Comment

    has_many :children, Comment, foreign_key: :parent_comment_id
    has_many :votes, CommentVote

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Domain comment entity."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          body: String.t() | nil,
          comment_type: String.t(),
          upvote_count: non_neg_integer(),
          downvote_count: non_neg_integer(),
          metadata: map(),
          deleted_at: DateTime.t() | nil,
          author_id: Ecto.UUID.t() | nil,
          puzzle_id: Ecto.UUID.t() | nil,
          submission_id: Ecto.UUID.t() | nil,
          parent_comment_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @doc """
  Changeset used when creating or updating a comment.
  """
  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(comment, attrs) do
    comment
    |> cast(attrs, [
      :legacy_id,
      :body,
      :comment_type,
      :upvote_count,
      :downvote_count,
      :metadata,
      :deleted_at,
      :author_id,
      :puzzle_id,
      :submission_id,
      :parent_comment_id
    ])
    |> validate_required([:body, :author_id])
    |> validate_length(:body, min: 1, max: 5_000)
    |> put_comment_type_default()
    |> validate_inclusion(:comment_type, @comment_types)
    |> normalize_metadata()
  end

  @doc """
  Changeset to mark a comment as deleted (soft delete).
  """
  @spec delete_changeset(t(), map()) :: Ecto.Changeset.t()
  def delete_changeset(comment, attrs) do
    comment
    |> cast(attrs, [:deleted_at, :metadata])
    |> put_change(:deleted_at, Map.get(attrs, :deleted_at, DateTime.utc_now()))
    |> normalize_metadata()
  end

  defp put_comment_type_default(%Ecto.Changeset{} = changeset) do
    case {get_field(changeset, :comment_type), get_field(changeset, :parent_comment_id),
          get_field(changeset, :puzzle_id)} do
      {nil, nil, _puzzle_id} -> put_change(changeset, :comment_type, "puzzle-comment")
      {nil, _parent_id, _} -> put_change(changeset, :comment_type, "comment-comment")
      _ -> changeset
    end
  end

  defp normalize_metadata(%Ecto.Changeset{} = changeset) do
    update_change(changeset, :metadata, fn
      nil -> %{}
      metadata when is_map(metadata) -> metadata
      _ -> %{}
    end)
  end
end
