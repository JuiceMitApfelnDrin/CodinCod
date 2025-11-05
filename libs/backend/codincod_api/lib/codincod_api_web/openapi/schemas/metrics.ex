defmodule CodincodApiWeb.OpenAPI.Schemas.Metrics do
  @moduledoc """
  OpenAPI schemas for metrics endpoints.
  """

  alias OpenApiSpex.Schema

  defmodule PlatformMetricsResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        totalUsers: %Schema{type: :integer},
        totalPuzzles: %Schema{type: :integer},
        totalSubmissions: %Schema{type: :integer},
        acceptedSubmissions: %Schema{type: :integer},
        activeUsers: %Schema{type: :integer},
        popularPuzzles: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              puzzleId: %Schema{type: :string, format: :uuid},
              title: %Schema{type: :string},
              difficulty: %Schema{type: :string},
              submissionCount: %Schema{type: :integer}
            }
          }
        }
      }
    })
  end

  defmodule UserStatsResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        userId: %Schema{type: :string, format: :uuid},
        username: %Schema{type: :string},
        totalSubmissions: %Schema{type: :integer},
        acceptedSubmissions: %Schema{type: :integer},
        wrongAnswerSubmissions: %Schema{type: :integer},
        timeLimitExceeded: %Schema{type: :integer},
        runtimeErrors: %Schema{type: :integer},
        puzzlesSolved: %Schema{type: :integer},
        acceptanceRate: %Schema{type: :number},
        difficultyBreakdown: %Schema{
          type: :object,
          properties: %{
            easy: %Schema{type: :integer},
            medium: %Schema{type: :integer},
            hard: %Schema{type: :integer},
            expert: %Schema{type: :integer}
          }
        },
        languageUsage: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              language: %Schema{type: :string},
              count: %Schema{type: :integer}
            }
          }
        },
        recentActivity: %Schema{type: :integer}
      }
    })
  end

  defmodule PuzzleStatsResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        puzzleId: %Schema{type: :string, format: :uuid},
        title: %Schema{type: :string},
        totalSubmissions: %Schema{type: :integer},
        acceptedSubmissions: %Schema{type: :integer},
        uniqueSolvers: %Schema{type: :integer},
        acceptanceRate: %Schema{type: :number},
        averageExecutionTime: %Schema{type: :number, nullable: true},
        languageDistribution: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              language: %Schema{type: :string},
              count: %Schema{type: :integer}
            }
          }
        },
        statusBreakdown: %Schema{
          type: :object,
          properties: %{
            accepted: %Schema{type: :integer},
            wrongAnswer: %Schema{type: :integer},
            timeLimitExceeded: %Schema{type: :integer},
            runtimeError: %Schema{type: :integer}
          }
        }
      }
    })
  end
end
