defmodule CodincodApiWeb.PuzzleCommentController do
  @moduledoc """
  Creates puzzle comments and replies (mirrors Fastify `/puzzle/:id/comment`).
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.{Comments, Puzzles}
  alias CodincodApi.Comments.Comment
  alias CodincodApi.Accounts.User
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  @min_length 1
  @max_length 320

  operation(:create,
    summary: "Create a comment on a puzzle",
    parameters: [
      id: [
        in: :path,
        description: "Puzzle ID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body: {"Comment creation payload", "application/json", Schemas.Comment.CreateRequest},
    responses: %{
      201 => {"Comment created successfully", "application/json", Schemas.Comment.CommentResponse},
      400 => {"Invalid payload", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle or parent comment not found", "application/json", Schemas.Common.ErrorResponse},
      422 => {"Cannot reply to deleted comment or invalid parent", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec create(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def create(conn, %{"id" => puzzle_id} = params) do
    with %User{id: user_id} = current_user <- conn.assigns[:current_user],
         {:ok, %{text: text, reply_on: reply_on}} <- validate_payload(conn.body_params, params),
         _puzzle <- Puzzles.get_puzzle!(puzzle_id),
         {:ok, parent_comment} <- load_parent_comment(reply_on, puzzle_id),
         attrs <- build_comment_attrs(puzzle_id, user_id, text, parent_comment),
         {:ok, %Comment{} = comment} <- Comments.create_comment(attrs, preload: [:author]) do
      conn
      |> put_status(:created)
      |> json(%{
        id: comment.id,
        body: comment.body,
        commentType: comment.comment_type,
        upvote: comment.upvote_count,
        downvote: comment.downvote_count,
        authorId: comment.author_id,
        puzzleId: comment.puzzle_id,
        parentCommentId: comment.parent_comment_id,
        insertedAt: comment.inserted_at,
        updatedAt: comment.updated_at,
        author: serialize_author(comment.author || current_user)
      })
    else
      {:error, :invalid_payload, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid payload", errors: errors})

      {:error, :parent_not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Parent comment not found"})

      {:error, :parent_deleted} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot reply to a deleted comment"})

      {:error, :invalid_parent} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Parent comment does not belong to this puzzle"})

      error ->
        CodincodApiWeb.FallbackController.call(conn, error)
    end
  end

  defp validate_payload(body_params, path_params) do
    params =
      body_params
      |> normalize_params()
      |> Map.merge(normalize_params(path_params))

    text = Map.get(params, "text") || Map.get(params, "body")
    reply_on = Map.get(params, "replyOn") || Map.get(params, "reply_on")

    with :ok <- validate_text(text),
         {:ok, reply_on_id} <- parse_optional_uuid(reply_on) do
      {:ok, %{text: text, reply_on: reply_on_id}}
    else
      {:error, reason} -> {:error, :invalid_payload, reason}
    end
  end

  defp normalize_params(%{} = params), do: params
  defp normalize_params(_), do: %{}

  defp validate_text(text) when is_binary(text) do
    len = String.length(text)

    cond do
      len < @min_length ->
        {:error, %{field: "text", message: "must be at least #{@min_length} characters"}}

      len > @max_length ->
        {:error, %{field: "text", message: "must be at most #{@max_length} characters"}}

      true ->
        :ok
    end
  end

  defp validate_text(_), do: {:error, %{field: "text", message: "must be a string"}}

  defp parse_optional_uuid(nil), do: {:ok, nil}
  defp parse_optional_uuid(""), do: {:ok, nil}

  defp parse_optional_uuid(value) when is_binary(value) do
    case Ecto.UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, %{field: "replyOn", message: "must be a valid UUID"}}
    end
  end

  defp parse_optional_uuid(_), do: {:error, %{field: "replyOn", message: "must be a UUID string"}}

  defp load_parent_comment(nil, _puzzle_id), do: {:ok, nil}

  defp load_parent_comment(parent_comment_id, puzzle_id) do
    case Comments.get_comment(parent_comment_id) do
      nil ->
        {:error, :parent_not_found}

      %Comment{deleted_at: deleted_at} when not is_nil(deleted_at) ->
        {:error, :parent_deleted}

      %Comment{puzzle_id: parent_puzzle_id} = comment when parent_puzzle_id == puzzle_id ->
        {:ok, comment}

      _comment ->
        {:error, :invalid_parent}
    end
  end

  defp build_comment_attrs(puzzle_id, user_id, text, nil) do
    %{
      puzzle_id: puzzle_id,
      author_id: user_id,
      body: text,
      comment_type: "puzzle-comment"
    }
  end

  defp build_comment_attrs(_puzzle_id, user_id, text, %Comment{} = parent) do
    %{
      puzzle_id: parent.puzzle_id,
      submission_id: parent.submission_id,
      author_id: user_id,
      body: text,
      comment_type: "comment-comment",
      parent_comment_id: parent.id
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
end
