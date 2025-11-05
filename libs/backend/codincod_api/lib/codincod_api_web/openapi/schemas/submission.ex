defmodule CodincodApiWeb.OpenAPI.Schemas.Submission do
  @moduledoc """
  Submission schemas used within OpenAPI responses.
  """

  require OpenApiSpex

  alias CodincodApiWeb.OpenAPI.Schemas.User

  defmodule ProgrammingLanguageSummary do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        _id: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        id: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        language: %OpenApiSpex.Schema{type: :string, nullable: true},
        version: %OpenApiSpex.Schema{type: :string, nullable: true},
        runtime: %OpenApiSpex.Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule PuzzleSummary do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        _id: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        id: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        title: %OpenApiSpex.Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule SubmissionResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        _id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        id: %OpenApiSpex.Schema{type: :string, format: :uuid},
        legacyId: %OpenApiSpex.Schema{type: :string, nullable: true},
        code: %OpenApiSpex.Schema{type: :string, nullable: true},
        result: %OpenApiSpex.Schema{type: :object, additionalProperties: true},
        score: %OpenApiSpex.Schema{type: :number, nullable: true},
        createdAt: %OpenApiSpex.Schema{type: :string, format: "date-time", nullable: true},
        updatedAt: %OpenApiSpex.Schema{type: :string, format: "date-time", nullable: true},
        puzzle: PuzzleSummary.schema(),
        programmingLanguage: ProgrammingLanguageSummary.schema(),
        user: User.Summary.schema(),
        gameId: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        legacyGameSubmissionId: %OpenApiSpex.Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule SubmissionListResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :array,
      items: SubmissionResponse.schema()
    })
  end

  defmodule SubmitCodeRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: ["puzzleId", "programmingLanguageId", "code", "userId"],
      properties: %{
        puzzleId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        programmingLanguageId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        code: %OpenApiSpex.Schema{type: :string, minLength: 1},
        userId: %OpenApiSpex.Schema{type: :string, format: :uuid}
      }
    })
  end

  defmodule SubmitCodeResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: [
        "submissionId",
        "code",
        "puzzleId",
        "programmingLanguageId",
        "userId",
        "codeLength",
        "result",
        "createdAt"
      ],
      properties: %{
        submissionId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        code: %OpenApiSpex.Schema{type: :string},
        puzzleId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        programmingLanguageId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        userId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        codeLength: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        result: %OpenApiSpex.Schema{
          type: :object,
          required: ["successRate", "passed", "failed", "total"],
          properties: %{
            successRate: %OpenApiSpex.Schema{type: :number, minimum: 0, maximum: 1},
            passed: %OpenApiSpex.Schema{type: :integer, minimum: 0},
            failed: %OpenApiSpex.Schema{type: :integer, minimum: 0},
            total: %OpenApiSpex.Schema{type: :integer, minimum: 1}
          }
        },
        createdAt: %OpenApiSpex.Schema{type: :string, format: "date-time"}
      }
    })
  end
end
