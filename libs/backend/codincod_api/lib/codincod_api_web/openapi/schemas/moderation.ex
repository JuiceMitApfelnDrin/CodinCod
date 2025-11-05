defmodule CodincodApiWeb.OpenAPI.Schemas.Moderation do
  @moduledoc """
  OpenAPI schemas for moderation endpoints.
  """

  alias OpenApiSpex.{Schema, Reference}

  defmodule CreateReportRequest do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CreateReportRequest",
      type: :object,
      properties: %{
        contentType: %Schema{type: :string, enum: ["puzzle", "comment", "submission", "user"]},
        contentId: %Schema{type: :string, format: :uuid},
        problemType: %Schema{
          type: :string,
          enum: ["spam", "inappropriate", "copyright", "harassment", "other"]
        },
        description: %Schema{type: :string, nullable: true}
      },
      required: [:contentType, :contentId, :problemType]
    })
  end

  defmodule ReportResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ReportResponse",
      type: :object,
      properties: %{
        id: %Schema{type: :string, format: :uuid},
        contentType: %Schema{type: :string},
        contentId: %Schema{type: :string, format: :uuid},
        problemType: %Schema{type: :string},
        description: %Schema{type: :string, nullable: true},
        status: %Schema{type: :string},
        reportedBy: %Schema{
          type: :object,
          nullable: true,
          properties: %{
            id: %Schema{type: :string, format: :uuid},
            username: %Schema{type: :string}
          }
        },
        resolvedBy: %Schema{
          type: :object,
          nullable: true,
          properties: %{
            id: %Schema{type: :string, format: :uuid},
            username: %Schema{type: :string}
          }
        },
        resolutionNotes: %Schema{type: :string, nullable: true},
        createdAt: %Schema{type: :string, format: :"date-time"},
        resolvedAt: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    })
  end

  defmodule ReportsListResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ReportsListResponse",
      type: :object,
      properties: %{
        reports: %Schema{type: :array, items: %Reference{"$ref": "#/components/schemas/ReportResponse"}},
        count: %Schema{type: :integer}
      }
    })
  end

  defmodule ResolveReportRequest do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ResolveReportRequest",
      type: :object,
      properties: %{
        status: %Schema{type: :string, enum: ["resolved", "dismissed"]},
        resolutionNotes: %Schema{type: :string, nullable: true}
      },
      required: [:status]
    })
  end

  defmodule ReviewResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ReviewResponse",
      type: :object,
      properties: %{
        id: %Schema{type: :string, format: :uuid},
        puzzleId: %Schema{type: :string, format: :uuid, nullable: true},
        status: %Schema{type: :string},
        # Fields for puzzle reviews
        title: %Schema{type: :string, nullable: true},
        description: %Schema{type: :string, nullable: true},
        authorName: %Schema{type: :string, nullable: true},
        # Fields for report reviews
        reportExplanation: %Schema{type: :string, nullable: true},
        reportedBy: %Schema{type: :string, nullable: true},
        reportedUserId: %Schema{type: :string, format: :uuid, nullable: true},
        reportedUserName: %Schema{type: :string, nullable: true},
        # Fields for game chat reports
        gameId: %Schema{type: :string, format: :uuid, nullable: true},
        reportedMessageId: %Schema{type: :string, format: :uuid, nullable: true},
        contextMessages: %Schema{
          type: :array,
          nullable: true,
          items: %Schema{
            type: :object,
            properties: %{
              _id: %Schema{type: :string, format: :uuid},
              username: %Schema{type: :string},
              message: %Schema{type: :string},
              timestamp: %Schema{type: :string, format: :"date-time"}
            }
          }
        },
        # Review metadata
        reviewer: %Schema{
          type: :object,
          nullable: true,
          properties: %{
            id: %Schema{type: :string, format: :uuid},
            username: %Schema{type: :string}
          }
        },
        reviewerNotes: %Schema{type: :string, nullable: true},
        createdAt: %Schema{type: :string, format: :"date-time"},
        reviewedAt: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    })
  end

  defmodule ReviewsListResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ReviewsListResponse",
      type: :object,
      properties: %{
        reviews: %Schema{type: :array, items: %Reference{"$ref": "#/components/schemas/ReviewResponse"}},
        count: %Schema{type: :integer}
      }
    })
  end

  defmodule ReviewDecisionRequest do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ReviewDecisionRequest",
      type: :object,
      properties: %{
        status: %Schema{type: :string, enum: ["approved", "rejected"]},
        reviewerNotes: %Schema{type: :string, nullable: true}
      },
      required: [:status]
    })
  end

  defmodule BanUserRequest do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "BanUserRequest",
      type: :object,
      properties: %{
        durationDays: %Schema{type: :integer, nullable: true},
        bannedUntil: %Schema{type: :string, format: :"date-time", nullable: true},
        reason: %Schema{type: :string, nullable: true}
      }
    })
  end

  defmodule BanResponse do
    @moduledoc false
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "BanResponse",
      type: :object,
      properties: %{
        userId: %Schema{type: :string, format: :uuid},
        banned: %Schema{type: :boolean},
        bannedUntil: %Schema{type: :string, format: :"date-time", nullable: true},
        reason: %Schema{type: :string, nullable: true}
      }
    })
  end
end
