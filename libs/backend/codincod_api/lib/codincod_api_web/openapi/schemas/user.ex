defmodule CodincodApiWeb.OpenAPI.Schemas.User do
  @moduledoc """
  User-related OpenAPI schemas shared across responses.
  """

  require OpenApiSpex

  alias CodincodApiWeb.OpenAPI.Schemas.{Puzzle, Submission}

  defmodule Profile do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "Profile",
      type: :object,
      properties: %{
        bio: %OpenApiSpex.Schema{type: :string, nullable: true},
        location: %OpenApiSpex.Schema{type: :string, nullable: true},
        picture: %OpenApiSpex.Schema{type: :string, nullable: true},
        socials: %OpenApiSpex.Schema{type: :array, items: %OpenApiSpex.Schema{type: :string}, nullable: true}
      }
    })
  end

  defmodule Summary do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        _id: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        id: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        legacyId: %OpenApiSpex.Schema{type: :string, nullable: true},
        legacyUsername: %OpenApiSpex.Schema{type: :string, nullable: true},
        username: %OpenApiSpex.Schema{type: :string},
        profile: Profile.schema(),
        role: %OpenApiSpex.Schema{type: :string, nullable: true},
        reportCount: %OpenApiSpex.Schema{type: :integer, nullable: true},
        banCount: %OpenApiSpex.Schema{type: :integer, nullable: true},
        currentBan: %OpenApiSpex.Schema{type: :string, format: :uuid, nullable: true},
        createdAt: %OpenApiSpex.Schema{type: :string, format: "date-time", nullable: true},
        updatedAt: %OpenApiSpex.Schema{type: :string, format: "date-time", nullable: true}
      }
    })
  end

  defmodule ShowResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string},
        user: Summary.schema()
      }
    })
  end

  defmodule AvailabilityResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        available: %OpenApiSpex.Schema{type: :boolean}
      }
    })
  end

  defmodule ActivityResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string},
        user: Summary.schema(),
        activity: %OpenApiSpex.Schema{
          type: :object,
          properties: %{
            puzzles: %OpenApiSpex.Schema{type: :array, items: Puzzle.PuzzleResponse.schema()},
            submissions: Submission.SubmissionListResponse.schema()
          }
        }
      }
    })
  end

  defmodule PaginatedPuzzlesResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        page: %OpenApiSpex.Schema{type: :integer, minimum: 1},
        pageSize: %OpenApiSpex.Schema{type: :integer, minimum: 1, maximum: 100},
        totalItems: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        totalPages: %OpenApiSpex.Schema{type: :integer, minimum: 0},
        items: %OpenApiSpex.Schema{type: :array, items: Puzzle.PuzzleResponse.schema()}
      }
    })
  end
end
