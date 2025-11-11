defmodule CodincodApiWeb.Router do
  use CodincodApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
      plug :debug_auth_request  # ADD THIS
    plug CodincodApiWeb.Plugs.AttachTokenFromCookie
    plug CodincodApiWeb.Auth.Pipeline
    plug CodincodApiWeb.Plugs.CurrentUser
  end

  defp debug_auth_request(conn, _opts) do
  require Logger

  conn = Plug.Conn.fetch_cookies(conn)

  Logger.info("=== AUTH REQUEST DEBUG ===")
  Logger.info("Path: #{conn.request_path}")
  Logger.info("All cookies: #{inspect(conn.req_cookies)}")
  Logger.info("Token cookie exists?: #{Map.has_key?(conn.req_cookies, "token")}")
  Logger.info("Token value: #{inspect(Map.get(conn.req_cookies, "token"))}")
  Logger.info("Auth header: #{inspect(Plug.Conn.get_req_header(conn, "authorization"))}")
  Logger.info("========================")

  conn
end

  pipeline :maybe_auth do
    plug CodincodApiWeb.Plugs.AttachTokenFromCookie

    plug Guardian.Plug.VerifyHeader,
      scheme: "Bearer",
      module: CodincodApiWeb.Auth.Guardian,
      allow_blank: true

    plug Guardian.Plug.LoadResource,
      module: CodincodApiWeb.Auth.Guardian,
      allow_blank: true

    plug CodincodApiWeb.Plugs.CurrentUser
  end

  @api_versions ["/api"]

  for base_path <- @api_versions do
    scope base_path, CodincodApiWeb do
      pipe_through [:api]

      get "/openapi.json", OpenApiController, :show
      get "/health", HealthController, :show
      get "/puzzles", PuzzleController, :index
      get "/programming-languages", ProgrammingLanguageController, :index
      get "/user/:username", UserController, :show
      get "/user/:username/activity", UserController, :activity
      get "/user/:username/isAvailable", UserController, :availability

      post "/login", AuthController, :login
      post "/register", AuthController, :register
      post "/password-reset/request", PasswordResetController, :request_reset
      post "/password-reset/reset", PasswordResetController, :reset_password
    end

    scope base_path, CodincodApiWeb do
      pipe_through [:api, :maybe_auth]

      get "/user/:username/puzzle", UserController, :puzzles
      get "/comment/:id", CommentController, :show
      get "/puzzle/:id", PuzzleController, :show
    end

    scope base_path, CodincodApiWeb do
      pipe_through [:api, :auth]

      post "/logout", AuthController, :logout
      post "/refresh", AuthController, :refresh
      get "/websocket-token", AuthController, :websocket_token

      get "/account", AccountController, :show
      patch "/account/profile", AccountController, :update_profile
      get "/account/leaderboard", AccountController, :leaderboard_rank
      get "/account/games", AccountController, :games

      get "/account/preferences", AccountPreferenceController, :show
      put "/account/preferences", AccountPreferenceController, :replace
      patch "/account/preferences", AccountPreferenceController, :patch
      delete "/account/preferences", AccountPreferenceController, :delete

      delete "/comment/:id", CommentController, :delete
      post "/comment/:id/vote", CommentController, :vote

      post "/puzzles", PuzzleController, :create
      get "/puzzle/:id/solution", PuzzleController, :solution
      patch "/puzzle/:id", PuzzleController, :update
      delete "/puzzle/:id", PuzzleController, :delete
      post "/puzzle/:id/comment", PuzzleCommentController, :create
      post "/submission", SubmissionController, :create
      get "/submission/:id", SubmissionController, :show
      post "/execute", ExecuteController, :create

      get "/leaderboard/global", LeaderboardController, :global
      get "/leaderboard/puzzle/:puzzle_id", LeaderboardController, :puzzle

      get "/metrics/platform", MetricsController, :platform
      get "/metrics/user/:user_id", MetricsController, :user_stats
      get "/metrics/puzzle/:puzzle_id", MetricsController, :puzzle_stats

      post "/moderation/report", ModerationController, :create_report
      get "/moderation/reports", ModerationController, :list_reports
      post "/moderation/report/:id/resolve", ModerationController, :resolve_report
      get "/moderation/reviews", ModerationController, :list_reviews
      post "/moderation/review/:id", ModerationController, :review_content
      post "/moderation/user/:user_id/ban", ModerationController, :ban_user
      post "/moderation/user/:user_id/unban", ModerationController, :unban_user

      get "/games/waiting", GameController, :list_waiting_rooms
      post "/games", GameController, :create
      get "/games/:id", GameController, :show
      post "/games/:id/join", GameController, :join
      post "/games/:id/leave", GameController, :leave
      post "/games/:id/start", GameController, :start
      post "/games/:id/submit", GameController, :submit_code
    end
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:codincod_api, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: CodincodApiWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
