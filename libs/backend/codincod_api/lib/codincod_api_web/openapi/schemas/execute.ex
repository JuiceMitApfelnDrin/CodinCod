defmodule CodincodApiWeb.OpenAPI.Schemas.Execute do
  @moduledoc """
  Execute API schemas for code execution without persistence.
  """

  require OpenApiSpex

  defmodule ExecuteRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: ["code", "language"],
      properties: %{
        code: %OpenApiSpex.Schema{type: :string, minLength: 1},
        language: %OpenApiSpex.Schema{type: :string, minLength: 1},
        testInput: %OpenApiSpex.Schema{type: :string, default: ""},
        testOutput: %OpenApiSpex.Schema{type: :string, default: ""}
      }
    })
  end

  defmodule PuzzleResultInformation do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        result: %OpenApiSpex.Schema{type: :string, enum: ["SUCCESS", "ERROR"]},
        successRate: %OpenApiSpex.Schema{type: :number, minimum: 0, maximum: 1},
        passed: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        failed: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        total: %OpenApiSpex.Schema{type: :integer, minimum: 1}
      }
    })
  end

  defmodule ExecuteResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        run: %OpenApiSpex.Schema{
          type: :object,
          additionalProperties: true
        },
        compile: %OpenApiSpex.Schema{
          type: :object,
          nullable: true,
          additionalProperties: true
        },
        puzzleResultInformation: PuzzleResultInformation.schema()
      }
    })
  end
end
