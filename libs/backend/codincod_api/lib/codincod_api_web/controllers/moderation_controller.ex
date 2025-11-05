defmodule CodincodApiWeb.ModerationController do
  @moduledoc """
  Handles content moderation, reporting, and admin review workflows.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.{Accounts, Moderation}
  alias CodincodApi.Accounts.User
  alias CodincodApi.Moderation.{ModerationReview, Report}
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  tags(["Moderation"])

  ## Reports

  operation(:create_report,
    summary: "Create a new report for inappropriate content",
    request_body: {"Report payload", "application/json", Schemas.Moderation.CreateReportRequest},
    responses: %{
      201 => {"Report created", "application/json", Schemas.Moderation.ReportResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      422 => {"Validation error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def create_report(conn, params) do
    with %User{id: user_id} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, attrs} <- normalize_report_params(params, user_id),
         {:ok, report} <- Moderation.create_report(attrs, preload: [:reported_by, :resolved_by]) do
      conn
      |> put_status(:created)
      |> json(serialize_report(report))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :invalid_payload} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid report payload"})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Validation failed", details: translate_errors(changeset)})
    end
  end

  operation(:list_reports,
    summary: "List reports (admin only)",
    parameters: [
      status: [
        in: :query,
        description: "Filter by status",
        schema: %OpenApiSpex.Schema{
          type: :string,
          enum: ["pending", "reviewing", "resolved", "dismissed"]
        },
        required: false
      ],
      problem_type: [
        in: :query,
        description: "Filter by problem type",
        schema: %OpenApiSpex.Schema{
          type: :string,
          enum: ["spam", "inappropriate", "copyright", "harassment", "other"]
        },
        required: false
      ]
    ],
    responses: %{
      200 => {"Reports list", "application/json", Schemas.Moderation.ReportsListResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def list_reports(conn, params) do
    with %User{} = user <- conn.assigns[:current_user] || {:error, :unauthorized},
         :ok <- ensure_admin(user) do
      filters = build_report_filters(params)
      reports = Moderation.list_reports(filters, preload: [:reported_by, :resolved_by])

      conn
      |> put_status(:ok)
      |> json(%{
        reports: Enum.map(reports, &serialize_report/1),
        count: length(reports)
      })
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Admin access required"})
    end
  end

  operation(:resolve_report,
    summary: "Resolve a report (admin only)",
    parameters: [
      id: [
        in: :path,
        description: "Report identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    request_body:
      {"Resolution payload", "application/json", Schemas.Moderation.ResolveReportRequest},
    responses: %{
      200 => {"Report resolved", "application/json", Schemas.Moderation.ReportResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Report not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def resolve_report(conn, %{"id" => report_id} = params) do
    with %User{id: user_id} = user <- conn.assigns[:current_user] || {:error, :unauthorized},
         :ok <- ensure_admin(user),
         {:ok, report_uuid} <- parse_uuid(report_id),
         report <- Moderation.get_report!(report_uuid),
         {:ok, attrs} <- normalize_resolution_params(params, user_id),
         {:ok, updated_report} <-
           Moderation.resolve_report(report, attrs, preload: [:reported_by, :resolved_by]) do
      conn
      |> put_status(:ok)
      |> json(serialize_report(updated_report))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Admin access required"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid report ID"})

      {:error, :invalid_payload} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid resolution payload"})
    end
  end

  ## Moderation Reviews

  operation(:list_reviews,
    summary: "List pending moderation reviews (moderator only)",
    parameters: [
      status: [
        in: :query,
        description: "Filter by status",
        schema: %OpenApiSpex.Schema{
          type: :string,
          enum: ["pending", "approved", "rejected"]
        },
        required: false
      ]
    ],
    responses: %{
      200 => {"Reviews list", "application/json", Schemas.Moderation.ReviewsListResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def list_reviews(conn, params) do
    with %User{} = user <- conn.assigns[:current_user] || {:error, :unauthorized},
         :ok <- ensure_moderator(user) do
      filters = build_review_filters(params)
      reviews = Moderation.list_reviews(filters, preload: [:puzzle, :reviewer])

      conn
      |> put_status(:ok)
      |> json(%{
        reviews: Enum.map(reviews, &serialize_review/1),
        count: length(reviews)
      })
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Moderator access required"})
    end
  end

  operation(:review_content,
    summary: "Review and approve/reject content (moderator only)",
    parameters: [
      id: [
        in: :path,
        description: "Review identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    request_body:
      {"Review decision", "application/json", Schemas.Moderation.ReviewDecisionRequest},
    responses: %{
      200 => {"Review updated", "application/json", Schemas.Moderation.ReviewResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Review not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def review_content(conn, %{"id" => review_id} = params) do
    with %User{id: user_id} = user <- conn.assigns[:current_user] || {:error, :unauthorized},
         :ok <- ensure_moderator(user),
         {:ok, review_uuid} <- parse_uuid(review_id),
         review <- Moderation.get_review!(review_uuid),
         {:ok, attrs} <- normalize_review_decision_params(params, user_id),
         {:ok, updated_review} <-
           Moderation.update_review(review, attrs, preload: [:puzzle, :reviewer]) do
      conn
      |> put_status(:ok)
      |> json(serialize_review(updated_review))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Moderator access required"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid review ID"})

      {:error, :invalid_payload} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid decision payload"})
    end
  end

  ## User Management (Admin)

  operation(:ban_user,
    summary: "Ban a user (admin only)",
    parameters: [
      user_id: [
        in: :path,
        description: "User identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    request_body: {"Ban details", "application/json", Schemas.Moderation.BanUserRequest},
    responses: %{
      200 => {"User banned", "application/json", Schemas.Moderation.BanResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"User not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def ban_user(conn, %{"user_id" => target_user_id} = params) do
    with %User{} = admin <- conn.assigns[:current_user] || {:error, :unauthorized},
         :ok <- ensure_admin(admin),
         {:ok, user_uuid} <- parse_uuid(target_user_id),
         {:ok, user} <- Accounts.fetch_user(user_uuid),
         {:ok, attrs} <- normalize_ban_params(params),
         {:ok, updated_user} <- Accounts.ban_user(user, attrs) do
      conn
      |> put_status(:ok)
      |> json(%{
        userId: updated_user.id,
        banned: true,
        bannedUntil: updated_user.banned_until,
        reason: attrs[:ban_reason]
      })
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Admin access required"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid user ID"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "User not found"})

      {:error, :invalid_payload} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid ban payload"})
    end
  end

  operation(:unban_user,
    summary: "Unban a user (admin only)",
    parameters: [
      user_id: [
        in: :path,
        description: "User identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid},
        required: true
      ]
    ],
    responses: %{
      200 => {"User unbanned", "application/json", Schemas.Moderation.BanResponse},
      400 => {"Bad request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"User not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def unban_user(conn, %{"user_id" => target_user_id}) do
    with %User{} = admin <- conn.assigns[:current_user] || {:error, :unauthorized},
         :ok <- ensure_admin(admin),
         {:ok, user_uuid} <- parse_uuid(target_user_id),
         {:ok, user} <- Accounts.fetch_user(user_uuid),
         {:ok, updated_user} <- Accounts.unban_user(user) do
      conn
      |> put_status(:ok)
      |> json(%{
        userId: updated_user.id,
        banned: false,
        bannedUntil: nil
      })
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Admin access required"})

      {:error, :invalid_uuid} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid user ID"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "User not found"})
    end
  end

  ## Private functions

  defp ensure_admin(%User{role: role}) do
    if role in ["admin", "moderator"] do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp ensure_moderator(%User{role: role}) do
    if role in ["admin", "moderator"] do
      :ok
    else
      {:error, :forbidden}
    end
  end

  defp normalize_report_params(params, user_id) when is_map(params) do
    with {:ok, _content_type} <- get_required_field(params, "contentType"),
         {:ok, content_id} <- get_required_field(params, "contentId"),
         {:ok, problem_type} <- get_required_field(params, "problemType") do
      {:ok,
       %{
         reported_by_id: user_id,
         problem_type: problem_type,
         problem_reference_id: content_id,
         explanation: Map.get(params, "description"),
         status: "pending"
       }}
    else
      _ -> {:error, :invalid_payload}
    end
  end

  defp normalize_resolution_params(params, admin_id) when is_map(params) do
    with {:ok, status} <- get_required_field(params, "status") do
      {:ok,
       %{
         status: status,
         resolved_by_id: admin_id,
         resolution_notes: Map.get(params, "resolutionNotes"),
         resolved_at: DateTime.utc_now()
       }}
    else
      _ -> {:error, :invalid_payload}
    end
  end

  defp normalize_review_decision_params(params, reviewer_id) when is_map(params) do
    with {:ok, status} <- get_required_field(params, "status") do
      {:ok,
       %{
         status: status,
         reviewer_id: reviewer_id,
         notes: Map.get(params, "reviewerNotes"),
         resolved_at: DateTime.utc_now()
       }}
    else
      _ -> {:error, :invalid_payload}
    end
  end

  defp normalize_ban_params(params) when is_map(params) do
    duration_days = Map.get(params, "durationDays")

    banned_until =
      if duration_days && is_integer(duration_days) do
        DateTime.utc_now() |> DateTime.add(duration_days * 24 * 60 * 60, :second)
      else
        Map.get(params, "bannedUntil")
      end

    {:ok,
     %{
       banned_until: banned_until,
       ban_reason: Map.get(params, "reason")
     }}
  end

  defp build_report_filters(params) do
    %{}
    |> maybe_add_filter(params, "status", :status)
    |> maybe_add_filter(params, "problemType", :problem_type)
  end

  defp build_review_filters(params) do
    %{}
    |> maybe_add_filter(params, "status", :status)
  end

  defp maybe_add_filter(filters, params, key, filter_key) do
    case Map.get(params, key) do
      nil -> filters
      value -> Map.put(filters, filter_key, value)
    end
  end

  defp get_required_field(params, key) do
    case Map.get(params, key) do
      nil -> {:error, :missing_field}
      value -> {:ok, value}
    end
  end

  defp serialize_report(%Report{} = report) do
    %{
      id: report.id,
      contentType: report.problem_type,
      contentId: report.problem_reference_id,
      problemType: report.problem_type,
      description: report.explanation,
      status: report.status,
      reportedBy:
        report.reported_by &&
          %{
            id: report.reported_by.id,
            username: report.reported_by.username
          },
      resolvedBy:
        report.resolved_by &&
          %{
            id: report.resolved_by.id,
            username: report.resolved_by.username
          },
      resolutionNotes: report.resolution_notes,
      createdAt: report.inserted_at,
      resolvedAt: report.resolved_at
    }
  end

  defp serialize_review(%ModerationReview{} = review) do
    %{
      id: review.id,
      puzzleId: review.puzzle_id,
      status: review.status,
      reviewer:
        review.reviewer &&
          %{
            id: review.reviewer.id,
            username: review.reviewer.username
          },
      reviewerNotes: review.notes,
      createdAt: review.inserted_at,
      reviewedAt: review.resolved_at
    }
  end

  defp parse_uuid(value) when is_binary(value) do
    case Ecto.UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, :invalid_uuid}
    end
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
