defmodule CodincodApiWeb.OpenAPI.Schemas.Leaderboard do
  @moduledoc """
  OpenAPI schemas for leaderboard endpoints.
  """

  alias OpenApiSpex.Schema

  defmodule GlobalLeaderboardResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        gameMode: %Schema{type: :string},
        rankings: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              rank: %Schema{type: :integer},
              userId: %Schema{type: :string, format: :uuid},
              username: %Schema{type: :string},
              rating: %Schema{type: :integer},
              puzzlesSolved: %Schema{type: :integer},
              totalSubmissions: %Schema{type: :integer},
              # Glicko rating system properties
              glicko: %Schema{
                type: :object,
                properties: %{
                  rd: %Schema{type: :number, description: "Rating deviation"},
                  vol: %Schema{type: :number, description: "Volatility"}
                }
              },
              # Game statistics
              gamesPlayed: %Schema{type: :integer},
              gamesWon: %Schema{type: :integer},
              winRate: %Schema{type: :number, format: :float},
              bestScore: %Schema{type: :number},
              averageScore: %Schema{type: :number}
            }
          }
        },
        limit: %Schema{type: :integer},
        offset: %Schema{type: :integer},
        totalPages: %Schema{type: :integer},
        totalEntries: %Schema{type: :integer},
        cachedAt: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    })
  end

  defmodule PuzzleLeaderboardResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        puzzleId: %Schema{type: :string, format: :uuid},
        rankings: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              rank: %Schema{type: :integer},
              userId: %Schema{type: :string, format: :uuid},
              username: %Schema{type: :string},
              executionTime: %Schema{type: :integer},
              memoryUsed: %Schema{type: :integer},
              submittedAt: %Schema{type: :string, format: :"date-time"}
            }
          }
        },
        limit: %Schema{type: :integer}
      }
    })
  end

  defmodule UserRankResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        userId: %Schema{type: :string, format: :uuid},
        rank: %Schema{type: :integer, nullable: true},
        rating: %Schema{type: :integer, nullable: true},
        puzzlesSolved: %Schema{type: :integer, nullable: true},
        totalSubmissions: %Schema{type: :integer, nullable: true}
      }
    })
  end
end
