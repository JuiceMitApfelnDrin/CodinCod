defmodule CodincodApiWeb.OpenAPI.Schemas.Games do
  @moduledoc """
  OpenAPI schemas for game/multiplayer endpoints.
  """

  alias OpenApiSpex.{Schema, Reference}

  defmodule CreateGameRequest do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CreateGameRequest",
      type: :object,
      properties: %{
        puzzleId: %Schema{type: :string, format: :uuid},
        maxPlayers: %Schema{type: :integer, minimum: 2, maximum: 10, default: 2},
        gameMode: %Schema{
          type: :string,
          enum: ["standard", "timed", "ranked"],
          default: "standard"
        },
        timeLimit: %Schema{type: :integer, nullable: true}
      },
      required: [:puzzleId]
    })
  end

  defmodule GameResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "GameResponse",
      type: :object,
      properties: %{
        id: %Schema{type: :string, format: :uuid},
        status: %Schema{type: :string},
        gameMode: %Schema{type: :string},
        maxPlayers: %Schema{type: :integer},
        timeLimit: %Schema{type: :integer, nullable: true},
        owner: %Schema{
          type: :object,
          properties: %{
            id: %Schema{type: :string, format: :uuid},
            username: %Schema{type: :string}
          }
        },
        puzzle: %Schema{
          type: :object,
          properties: %{
            id: %Schema{type: :string, format: :uuid},
            title: %Schema{type: :string},
            difficulty: %Schema{type: :string}
          }
        },
        players: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              id: %Schema{type: :string, format: :uuid},
              username: %Schema{type: :string},
              role: %Schema{type: :string},
              joinedAt: %Schema{type: :string, format: :"date-time"}
            }
          }
        },
        createdAt: %Schema{type: :string, format: :"date-time"},
        startedAt: %Schema{type: :string, format: :"date-time", nullable: true},
        finishedAt: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    })
  end

  defmodule WaitingRoomsResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WaitingRoomsResponse",
      type: :object,
      properties: %{
        rooms: %Schema{
          type: :array,
          items: GameResponse.schema()
        },
        count: %Schema{type: :integer}
      }
    })
  end

  defmodule UserGamesResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserGamesResponse",
      type: :object,
      properties: %{
        games: %Schema{
          type: :array,
          items: GameResponse.schema()
        },
        count: %Schema{type: :integer}
      }
    })
  end

  defmodule LeaveGameResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "LeaveGameResponse",
      type: :object,
      properties: %{
        message: %Schema{type: :string}
      }
    })
  end

  defmodule GameSubmitCodeRequest do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "GameSubmitCodeRequest",
      description: "Request to link a submission to a game. This is the correct type for game submissions (not to be confused with SubmitCodeRequest for direct code submission)",
      type: :object,
      properties: %{
        submissionId: %Schema{
          type: :string,
          format: :uuid,
          description: "The ID of the submission to link to the game"
        }
      },
      required: [:submissionId]
    })
  end

  defmodule SubmitCodeResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubmitCodeResponse",
      type: :object,
      properties: %{
        message: %Schema{type: :string},
        submissionId: %Schema{type: :string, format: :uuid},
        gameId: %Schema{type: :string, format: :uuid}
      }
    })
  end
end
