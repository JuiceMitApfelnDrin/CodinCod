defmodule CodincodApiWeb.OpenAPI.Schemas.Comment do
  @moduledoc """
  Comment schemas used across OpenAPI responses and requests.
  """

  require OpenApiSpex

  defmodule Author do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        username: %OpenApiSpex.Schema{type: :string},
        role: %OpenApiSpex.Schema{type: :string}
      }
    })
  end

  defmodule CommentResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        body: %OpenApiSpex.Schema{type: :string},
        commentType: %OpenApiSpex.Schema{
          type: :string,
          enum: ["puzzle-comment", "comment-comment", "submission-comment"]
        },
        upvote: %OpenApiSpex.Schema{type: :integer, default: 0},
        downvote: %OpenApiSpex.Schema{type: :integer, default: 0},
        authorId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        puzzleId: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        parentCommentId: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        insertedAt: %OpenApiSpex.Schema{type: :string, format: :"date-time"},
        updatedAt: %OpenApiSpex.Schema{type: :string, format: :"date-time"},
        author: Author.schema()
      },
      required: [:id, :body, :commentType, :authorId]
    })
  end

  defmodule CreateRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: [:text],
      properties: %{
        text: %OpenApiSpex.Schema{type: :string, minLength: 1, maxLength: 320},
        replyOn: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true}
      }
    })
  end

  defmodule VoteRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: [:type],
      properties: %{
        type: %OpenApiSpex.Schema{type: :string, enum: ["upvote", "downvote"]}
      }
    })
  end
end
