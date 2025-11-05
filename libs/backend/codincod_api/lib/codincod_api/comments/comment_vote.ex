defmodule CodincodApi.Comments.CommentVote do
  @moduledoc """
  Represents a single user's vote (upvote/downvote) on a comment.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User
  alias CodincodApi.Comments.Comment

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @vote_types ["upvote", "downvote"]

  schema "comment_votes" do
    field :vote_type, :string

    belongs_to :comment, Comment
    belongs_to :user, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "User's vote on a comment."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          vote_type: String.t(),
          comment_id: Ecto.UUID.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(vote, attrs) do
    vote
    |> cast(attrs, [:vote_type, :comment_id, :user_id])
    |> validate_required([:vote_type, :comment_id, :user_id])
    |> validate_inclusion(:vote_type, @vote_types)
    |> unique_constraint([:comment_id, :user_id])
  end
end
