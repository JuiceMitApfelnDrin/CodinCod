defmodule CodincodApiWeb.OpenAPI.Schemas.Puzzle do
  @moduledoc """
  Puzzle schemas used across OpenAPI responses and requests.
  """

  require OpenApiSpex

  alias CodincodApiWeb.OpenAPI.Schemas.User

  defmodule Validator do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        input: %OpenApiSpex.Schema{type: :string, description: "Validator input payload"},
        output: %OpenApiSpex.Schema{type: :string, description: "Expected validator output"},
        isPublic: %OpenApiSpex.Schema{type: :boolean, default: false},
        createdAt: %OpenApiSpex.Schema{type: :string, format: :"date-time"},
        updatedAt: %OpenApiSpex.Schema{type: :string, format: :"date-time"}
      }
    })
  end

  defmodule Solution do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        code: %OpenApiSpex.Schema{type: :string, default: ""},
        programmingLanguage: %OpenApiSpex.Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule Author do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        _id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        username: %OpenApiSpex.Schema{type: :string},
        profile: User.Profile.schema(),
        role: %OpenApiSpex.Schema{type: :string},
        createdAt: %OpenApiSpex.Schema{type: :string, format: :"date-time"},
        updatedAt: %OpenApiSpex.Schema{type: :string, format: :"date-time"}
      }
    })
  end

  defmodule PuzzleResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        _id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        legacyId: %OpenApiSpex.Schema{type: :string, nullable: true},
        title: %OpenApiSpex.Schema{type: :string},
        statement: %OpenApiSpex.Schema{type: :string, nullable: true},
        constraints: %OpenApiSpex.Schema{type: :string, nullable: true},
        author: Author.schema(),
        validators: %OpenApiSpex.Schema{type: :array, items: Validator.schema()},
        difficulty: %OpenApiSpex.Schema{type: :string},
        visibility: %OpenApiSpex.Schema{type: :string},
        createdAt: %OpenApiSpex.Schema{type: :string, format: :"date-time", nullable: true},
        updatedAt: %OpenApiSpex.Schema{type: :string, format: :"date-time", nullable: true},
        solution: Solution.schema(),
        puzzleMetrics: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        legacyMetricsId: %OpenApiSpex.Schema{type: :string, nullable: true},
        tags: %OpenApiSpex.Schema{type: :array, items: %OpenApiSpex.Schema{type: :string}},
        comments: %OpenApiSpex.Schema{type: :array, items: %OpenApiSpex.Schema{type: :string}},
        moderationFeedback: %OpenApiSpex.Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule PuzzleCreateRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "PuzzleCreateRequest",
      type: :object,
      required: [:title],
      properties: %{
        title: %OpenApiSpex.Schema{type: :string, minLength: 4, maxLength: 128},
        description: %OpenApiSpex.Schema{type: :string, minLength: 1, nullable: true},
        difficulty: %OpenApiSpex.Schema{
          type: :string,
          enum: ["easy", "medium", "hard", "beginner", "intermediate", "advanced", "expert"],
          nullable: true
        },
        validators: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{
            type: :object,
            required: [:input, :output],
            properties: %{
              input: %OpenApiSpex.Schema{type: :string},
              output: %OpenApiSpex.Schema{type: :string},
              isPublic: %OpenApiSpex.Schema{type: :boolean}
            }
          },
          nullable: true
        },
        tags: %OpenApiSpex.Schema{
          type: :array,
          nullable: true,
          items: %OpenApiSpex.Schema{type: :string}
        },
        constraints: %OpenApiSpex.Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule PaginatedListResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        page: %OpenApiSpex.Schema{type: :integer, minimum: 1, default: 1},
        pageSize: %OpenApiSpex.Schema{type: :integer, minimum: 1, maximum: 100, default: 20},
        totalItems: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        totalPages: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        items: %OpenApiSpex.Schema{type: :array, items: PuzzleResponse.schema()}
      }
    })
  end
end
