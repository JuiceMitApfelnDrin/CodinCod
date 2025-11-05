defmodule CodincodApi.Comments do
  @moduledoc """
  Commenting system with nested replies, soft deletion and vote tracking.
  """

  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias CodincodApi.Repo

  alias CodincodApi.Comments.{Comment, CommentVote}

  @vote_types ["upvote", "downvote"]
  @default_preloads [author: [], children: [author: []]]

  @type comment_params :: map()

  @spec list_for_puzzle(Ecto.UUID.t(), keyword()) :: [Comment.t()]
  def list_for_puzzle(puzzle_id, opts \\ []) do
    Comment
    |> where([c], c.puzzle_id == ^puzzle_id)
    |> order_by([c], asc: c.inserted_at)
    |> exclude_deleted(opts)
    |> maybe_preload(opts)
    |> Repo.all()
  end

  @spec list_replies(Ecto.UUID.t(), keyword()) :: [Comment.t()]
  def list_replies(parent_comment_id, opts \\ []) do
    Comment
    |> where([c], c.parent_comment_id == ^parent_comment_id)
    |> order_by([c], asc: c.inserted_at)
    |> exclude_deleted(opts)
    |> maybe_preload(opts)
    |> Repo.all()
  end

  @spec get_comment!(Ecto.UUID.t(), keyword()) :: Comment.t()
  def get_comment!(id, opts \\ []) do
    Comment
    |> maybe_preload(opts)
    |> Repo.get!(id)
  end

  @spec get_comment(Ecto.UUID.t(), keyword()) :: Comment.t() | nil
  def get_comment(id, opts \\ []) do
    Comment
    |> maybe_preload(opts)
    |> Repo.get(id)
  end

  @spec create_comment(comment_params(), keyword()) ::
          {:ok, Comment.t()} | {:error, Ecto.Changeset.t()}
  def create_comment(attrs, opts \\ []) do
    %Comment{}
    |> Comment.changeset(attrs)
    |> Repo.insert()
    |> preload_result(opts)
  end

  @spec reply(Comment.t(), comment_params(), keyword()) ::
          {:ok, Comment.t()} | {:error, Ecto.Changeset.t()}
  def reply(%Comment{id: parent_id, puzzle_id: puzzle_id}, attrs, opts \\ []) do
    attrs =
      attrs
      |> Map.put(:parent_comment_id, parent_id)
      |> Map.put_new(:puzzle_id, puzzle_id)

    create_comment(attrs, opts)
  end

  @spec soft_delete(Comment.t(), map()) :: {:ok, Comment.t()} | {:error, Ecto.Changeset.t()}
  def soft_delete(%Comment{} = comment, attrs \\ %{}) do
    comment
    |> Comment.delete_changeset(attrs)
    |> Repo.update()
  end

  @spec toggle_vote(Comment.t(), Ecto.UUID.t(), String.t()) ::
          {:ok, Comment.t()} | {:error, term()}
  def toggle_vote(%Comment{} = comment, user_id, vote_type) when vote_type in @vote_types do
    Multi.new()
    |> Multi.run(:existing_vote, fn repo, _changes ->
      {:ok, repo.get_by(CommentVote, comment_id: comment.id, user_id: user_id)}
    end)
    |> Multi.run(:upsert_vote, fn repo, %{existing_vote: existing_vote} ->
      handle_vote_transition(repo, existing_vote, comment, user_id, vote_type)
    end)
    |> Multi.run(:refresh_counts, fn repo, _changes ->
      {:ok, recalculate_vote_totals(repo, comment.id)}
    end)
    |> Multi.run(:comment, fn repo, _changes ->
      {:ok, repo.get!(Comment, comment.id)}
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{comment: updated}} -> {:ok, Repo.preload(updated, [:author])}
      {:error, _step, reason, _} -> {:error, reason}
    end
  end

  def toggle_vote(_comment, _user_id, vote_type), do: {:error, {:invalid_vote_type, vote_type}}

  defp handle_vote_transition(repo, nil, comment, user_id, vote_type) do
    %CommentVote{}
    |> CommentVote.changeset(%{comment_id: comment.id, user_id: user_id, vote_type: vote_type})
    |> repo.insert()
  end

  defp handle_vote_transition(
         repo,
         %CommentVote{vote_type: vote_type} = vote,
         _comment,
         _user_id,
         vote_type
       ) do
    repo.delete(vote)
  end

  defp handle_vote_transition(repo, %CommentVote{} = vote, _comment, _user_id, vote_type) do
    vote
    |> CommentVote.changeset(%{vote_type: vote_type})
    |> repo.update()
  end

  defp recalculate_vote_totals(repo, comment_id) do
    counts =
      from(v in CommentVote,
        where: v.comment_id == ^comment_id,
        group_by: v.vote_type,
        select: {v.vote_type, count(v.id)}
      )
      |> repo.all()
      |> Map.new()

    upvotes = Map.get(counts, "upvote", 0)
    downvotes = Map.get(counts, "downvote", 0)

    repo.update_all(
      from(c in Comment, where: c.id == ^comment_id),
      set: [upvote_count: upvotes, downvote_count: downvotes]
    )

    {:ok, %{upvote_count: upvotes, downvote_count: downvotes}}
  end

  defp exclude_deleted(query, opts) do
    if Keyword.get(opts, :include_deleted, false) do
      query
    else
      where(query, [c], is_nil(c.deleted_at))
    end
  end

  defp maybe_preload(query, opts) do
    case Keyword.get(opts, :preload, @default_preloads) do
      nil -> query
      preloads -> preload(query, ^preloads)
    end
  end

  defp preload_result({:ok, comment}, opts) do
    preloads = Keyword.get(opts, :preload, @default_preloads)

    {:ok,
     case preloads do
       nil -> comment
       _ -> Repo.preload(comment, preloads)
     end}
  end

  defp preload_result(other, _opts), do: other
end
