defmodule CodincodApiWeb.CommentController do
  @moduledoc """
  Handles comment retrieval, deletion, and voting endpoints.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.Comments
  alias CodincodApi.Comments.Comment
  alias CodincodApi.Accounts.User
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  @preloads [
    author: [],
    children: [author: []]
  ]

  operation(:show,
    summary: "Get comment by ID",
    parameters: [
      id: [
        in: :path,
        description: "Comment ID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      ok: {"Comment details", "application/json", Schemas.Comment.CommentResponse},
      not_found: {"Comment not found", "application/json", Schemas.Common.ErrorResponse}
    ]
  )

  def show(conn, %{"id" => id}) do
    comment = Comments.get_comment!(id, preload: @preloads)
    json(conn, serialize_comment(comment))
  end

  operation(:delete,
    summary: "Delete a comment",
    parameters: [
      id: [
        in: :path,
        description: "Comment ID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      no_content: "Comment deleted successfully",
      forbidden: {"Not authorized to delete this comment", "application/json", Schemas.Common.ErrorResponse},
      not_found: {"Comment not found", "application/json", Schemas.Common.ErrorResponse}
    ]
  )

  def delete(conn, %{"id" => id}) do
    with %Comment{} = comment <- Comments.get_comment!(id, preload: [:author]),
         %User{} = current_user <- conn.assigns[:current_user],
         :ok <- authorize_comment_delete(comment, current_user),
         {:ok, _comment} <- Comments.soft_delete(comment) do
      send_resp(conn, :no_content, "")
    else
      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: "You cannot delete this comment"})

      error ->
        CodincodApiWeb.FallbackController.call(conn, error)
    end
  end

  operation(:vote,
    summary: "Vote on a comment",
    parameters: [
      id: [
        in: :path,
        description: "Comment ID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body: {"Vote request", "application/json", Schemas.Comment.VoteRequest},
    responses: [
      ok: {"Updated comment with vote", "application/json", Schemas.Comment.CommentResponse},
      bad_request: {"Invalid vote type", "application/json", Schemas.Common.ErrorResponse},
      not_found: {"Comment not found", "application/json", Schemas.Common.ErrorResponse},
      unprocessable_entity: {"Unable to process vote", "application/json", Schemas.Common.ErrorResponse}
    ]
  )

  def vote(conn, %{"id" => id} = params) do
    with %Comment{} = comment <- Comments.get_comment!(id),
         %User{id: user_id} <- conn.assigns[:current_user],
         {:ok, vote_type} <- extract_vote_type(conn.body_params, params),
         {:ok, %Comment{} = updated} <- Comments.toggle_vote(comment, user_id, vote_type) do
      json(conn, serialize_comment(updated))
    else
      {:error, {:invalid_vote_type, _}} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid vote type", allowed: ["upvote", "downvote"]})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Unable to update vote", errors: translate_errors(changeset)})

      error ->
        CodincodApiWeb.FallbackController.call(conn, error)
    end
  end

  defp authorize_comment_delete(%Comment{author_id: author_id}, %User{id: user_id, role: role}) do
    if author_id == user_id or role in ["moderator", "admin"] do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp extract_vote_type(%{"type" => type}, _params) when type in ["upvote", "downvote"],
    do: {:ok, type}

  defp extract_vote_type(_body_params, %{"type" => type}) when type in ["upvote", "downvote"],
    do: {:ok, type}

  defp extract_vote_type(_, _), do: {:error, {:invalid_vote_type, nil}}

  defp serialize_comment(%Comment{} = comment) do
    %{
      id: comment.id,
      body: comment.body,
      commentType: comment.comment_type,
      upvote: comment.upvote_count,
      downvote: comment.downvote_count,
      authorId: comment.author_id,
      puzzleId: comment.puzzle_id,
      submissionId: comment.submission_id,
      parentCommentId: comment.parent_comment_id,
      deletedAt: comment.deleted_at,
      insertedAt: comment.inserted_at,
      updatedAt: comment.updated_at,
      author: serialize_author(comment.author),
      children: Enum.map(comment.children || [], &serialize_comment/1)
    }
  end

  defp serialize_author(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
      role: user.role
    }
  end

  defp serialize_author(_), do: nil

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
