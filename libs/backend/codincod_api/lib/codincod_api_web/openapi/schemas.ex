defmodule CodincodApiWeb.OpenAPI.Schemas do
  @moduledoc """
  Registry of OpenAPI schemas shared across the API specification.
  """

  def registry do
    %{
      LoginRequest: CodincodApiWeb.OpenAPI.Schemas.Auth.LoginRequest.schema(),
      RegisterRequest: CodincodApiWeb.OpenAPI.Schemas.Auth.RegisterRequest.schema(),
      AuthMessageResponse: CodincodApiWeb.OpenAPI.Schemas.Auth.MessageResponse.schema(),
      ErrorResponse: CodincodApiWeb.OpenAPI.Schemas.Common.ErrorResponse.schema(),
      AccountStatusResponse: CodincodApiWeb.OpenAPI.Schemas.Account.StatusResponse.schema(),
      AccountProfileUpdateRequest:
        CodincodApiWeb.OpenAPI.Schemas.Account.ProfileUpdateRequest.schema(),
      AccountProfileUpdateResponse:
        CodincodApiWeb.OpenAPI.Schemas.Account.ProfileUpdateResponse.schema(),
      AccountPreferences: CodincodApiWeb.OpenAPI.Schemas.Account.PreferencesPayload.schema(),
      PuzzlePaginatedListResponse:
        CodincodApiWeb.OpenAPI.Schemas.Puzzle.PaginatedListResponse.schema(),
      PuzzleCreateRequest: CodincodApiWeb.OpenAPI.Schemas.Puzzle.PuzzleCreateRequest.schema(),
      PuzzleResponse: CodincodApiWeb.OpenAPI.Schemas.Puzzle.PuzzleResponse.schema(),
      UserSummary: CodincodApiWeb.OpenAPI.Schemas.User.Summary.schema(),
      UserShowResponse: CodincodApiWeb.OpenAPI.Schemas.User.ShowResponse.schema(),
      UserAvailabilityResponse: CodincodApiWeb.OpenAPI.Schemas.User.AvailabilityResponse.schema(),
      UserActivityResponse: CodincodApiWeb.OpenAPI.Schemas.User.ActivityResponse.schema(),
      SubmissionResponse: CodincodApiWeb.OpenAPI.Schemas.Submission.SubmissionResponse.schema(),
      SubmissionSubmitRequest:
        CodincodApiWeb.OpenAPI.Schemas.Submission.SubmitCodeRequest.schema(),
      SubmissionSubmitResponse:
        CodincodApiWeb.OpenAPI.Schemas.Submission.SubmitCodeResponse.schema(),
      ExecuteRequest: CodincodApiWeb.OpenAPI.Schemas.Execute.ExecuteRequest.schema(),
      ExecuteResponse: CodincodApiWeb.OpenAPI.Schemas.Execute.ExecuteResponse.schema(),
      PasswordResetRequest: CodincodApiWeb.OpenAPI.Schemas.PasswordReset.RequestPayload.schema(),
      PasswordResetResponse:
        CodincodApiWeb.OpenAPI.Schemas.PasswordReset.RequestResponse.schema(),
      PasswordResetPayload: CodincodApiWeb.OpenAPI.Schemas.PasswordReset.ResetPayload.schema(),
      PasswordResetCompleteResponse:
        CodincodApiWeb.OpenAPI.Schemas.PasswordReset.ResetResponse.schema(),
      # Leaderboard schemas
      GlobalLeaderboardResponse:
        CodincodApiWeb.OpenAPI.Schemas.Leaderboard.GlobalLeaderboardResponse.schema(),
      PuzzleLeaderboardResponse:
        CodincodApiWeb.OpenAPI.Schemas.Leaderboard.PuzzleLeaderboardResponse.schema(),
      UserRankResponse: CodincodApiWeb.OpenAPI.Schemas.Leaderboard.UserRankResponse.schema(),
      # Metrics schemas
      PlatformMetricsResponse:
        CodincodApiWeb.OpenAPI.Schemas.Metrics.PlatformMetricsResponse.schema(),
      UserStatsResponse: CodincodApiWeb.OpenAPI.Schemas.Metrics.UserStatsResponse.schema(),
      PuzzleStatsResponse: CodincodApiWeb.OpenAPI.Schemas.Metrics.PuzzleStatsResponse.schema(),
      # Moderation schemas
      CreateReportRequest: CodincodApiWeb.OpenAPI.Schemas.Moderation.CreateReportRequest.schema(),
      ReportResponse: CodincodApiWeb.OpenAPI.Schemas.Moderation.ReportResponse.schema(),
      ReportsListResponse: CodincodApiWeb.OpenAPI.Schemas.Moderation.ReportsListResponse.schema(),
      ResolveReportRequest:
        CodincodApiWeb.OpenAPI.Schemas.Moderation.ResolveReportRequest.schema(),
      ReviewResponse: CodincodApiWeb.OpenAPI.Schemas.Moderation.ReviewResponse.schema(),
      ReviewsListResponse: CodincodApiWeb.OpenAPI.Schemas.Moderation.ReviewsListResponse.schema(),
      ReviewDecisionRequest:
        CodincodApiWeb.OpenAPI.Schemas.Moderation.ReviewDecisionRequest.schema(),
      BanUserRequest: CodincodApiWeb.OpenAPI.Schemas.Moderation.BanUserRequest.schema(),
      BanResponse: CodincodApiWeb.OpenAPI.Schemas.Moderation.BanResponse.schema(),
      # Games schemas
      CreateGameRequest: CodincodApiWeb.OpenAPI.Schemas.Games.CreateGameRequest.schema(),
      GameResponse: CodincodApiWeb.OpenAPI.Schemas.Games.GameResponse.schema(),
      WaitingRoomsResponse: CodincodApiWeb.OpenAPI.Schemas.Games.WaitingRoomsResponse.schema(),
      UserGamesResponse: CodincodApiWeb.OpenAPI.Schemas.Games.UserGamesResponse.schema(),
      LeaveGameResponse: CodincodApiWeb.OpenAPI.Schemas.Games.LeaveGameResponse.schema(),
      # Comment schemas
      CommentCreateRequest: CodincodApiWeb.OpenAPI.Schemas.Comment.CreateRequest.schema(),
      CommentResponse: CodincodApiWeb.OpenAPI.Schemas.Comment.CommentResponse.schema(),
      CommentVoteRequest: CodincodApiWeb.OpenAPI.Schemas.Comment.VoteRequest.schema()
    }
  end
end
