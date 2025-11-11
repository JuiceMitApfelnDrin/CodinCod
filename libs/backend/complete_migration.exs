#!/usr/bin/env elixir

# CodinCod Elixir Backend - Complete Migration Script
# This script guides you through completing the entire backend migration

Mix.start()

IO.puts """
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║           CodinCod Backend Migration - Completion Guide                 ║
║                                                                          ║
║                  TypeScript → Elixir Migration                          ║
║                   MongoDB → PostgreSQL Migration                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

This guide will walk you through completing the backend migration.
Follow the steps carefully and run each command in sequence.

"""

defmodule MigrationGuide do
  def step(number, title) do
    IO.puts "\n┌────────────────────────────────────────────────────────────────────┐"
    IO.puts "│ STEP #{number}: #{title}"
    IO.puts "└────────────────────────────────────────────────────────────────────┘\n"
  end

  def command(cmd, description) do
    IO.puts "   #{description}"
    IO.puts "   $ #{cmd}\n"
  end

  def info(msg) do
    IO.puts "   ℹ️  #{msg}\n"
  end

  def warn(msg) do
    IO.ANSI.format([:yellow, "   ⚠️  #{msg}\n"]) |> IO.write()
  end

  def success(msg) do
    IO.ANSI.format([:green, "   ✅ #{msg}\n"]) |> IO.write()
  end

  def pause() do
    IO.gets("\n   Press ENTER to continue...")
  end
end

import MigrationGuide

step(1, "Fix bcrypt Compilation (Windows)")
info("Choose ONE of the following options:")
IO.puts """
   Option A: Use WSL2 (RECOMMENDED)
   $ wsl --install
   $ wsl
   $ cd /mnt/c/Users/ReevenGovaert/Documents/projects/CodinCod/libs/backend/codincod_api

   Option B: Install Visual Studio Build Tools
   Download from: https://visualstudio.microsoft.com/downloads/
   Install "Desktop development with C++"

   Option C: Use Docker
   $ docker build -t codincod-api .

   Option D: Switch to pbkdf2 (dev only)
   Replace bcrypt_elixir with pbkdf2_elixir in mix.exs
"""
pause()

step(2, "Install Dependencies & Compile")
command("mix deps.get", "Download all dependencies")
command("mix deps.compile", "Compile dependencies")
command("mix compile", "Compile application")
pause()

step(3, "Start PostgreSQL Database")
command("docker-compose up -d postgres redis", "Start database services")
command("docker-compose ps", "Verify services are running")
pause()

step(4, "Create Database")
command("mix ecto.create", "Create development database")
command("mix ecto.create MIX_ENV=test", "Create test database")
success("Databases created!")
pause()

step(5, "Generate Authentication System")
warn("This command will ask questions. Answer as follows:")
IO.puts """
   An authentication system can be created in two different ways:
   - Using Phoenix.LiveView (default)
   - Using Phoenix.Controller only

   CHOOSE: No (we want API-only)

   An accounts context already exists...
   CHOOSE: No (or Yes to overwrite)
"""
command("mix phx.gen.auth Accounts User users --binary-id", "Generate auth system")
pause()

step(6, "Customize User Schema")
info("Edit: lib/codincod_api/accounts/user.ex")
IO.puts """
   Add these fields to the schema block:

     field :profile_avatar_url, :string
     field :profile_bio, :text
     field :profile_location, :string
     field :role, Ecto.Enum, values: [:user, :admin, :moderator], default: :user
     field :report_count, :integer, default: 0
     field :ban_count, :integer, default: 0
     field :legacy_mongo_id, :string
     belongs_to :current_ban, CodincodApi.Moderation.UserBan
"""
pause()

step(7, "Create UserBan Schema")
command(
  "mix phx.gen.schema Moderation.UserBan user_bans user_id:references:users banned_by_id:references:users reason:text ban_type:string expires_at:utc_datetime --binary-id",
  "Create moderation schema"
)
pause()

step(8, "Create ProgrammingLanguage Schema")
command(
  "mix phx.gen.context Languages ProgrammingLanguage programming_languages name:string version:string piston_runtime:string is_active:boolean --binary-id",
  "Create language context"
)
pause()

step(9, "Create Puzzle Context & Schema")
command(
  ~s(mix phx.gen.context Puzzles Puzzle puzzles title:string statement:text constraints:text difficulty:string visibility:string author_id:references:users --binary-id),
  "Create puzzle context"
)
pause()

step(10, "Create Submission Context & Schema")
command(
  "mix phx.gen.context Submissions Submission submissions code:text result:map user_id:references:users puzzle_id:references:puzzles programming_language_id:references:programming_languages --binary-id",
  "Create submission context"
)
pause()

step(11, "Create Game Context & Schema")
command(
  "mix phx.gen.context Games Game games owner_id:references:users puzzle_id:references:puzzles start_time:utc_datetime end_time:utc_datetime options:map --binary-id",
  "Create game context"
)
pause()

step(12, "Create GamePlayer Join Table")
command(
  "mix phx.gen.schema Games.GamePlayer game_players game_id:references:games user_id:references:users joined_at:utc_datetime submission_id:references:submissions --binary-id",
  "Create game player schema"
)
pause()

step(13, "Create Comment Context & Schema")
command(
  "mix phx.gen.context Comments Comment comments author_id:references:users text:text upvote:integer downvote:integer comment_type:string parent_id:references:comments --binary-id",
  "Create comment context"
)
pause()

step(14, "Create ChatMessage Schema")
command(
  "mix phx.gen.context Chat ChatMessage chat_messages game_id:references:games user_id:references:users message:text is_deleted:boolean --binary-id",
  "Create chat context"
)
pause()

step(15, "Create UserVote Schema")
command(
  "mix phx.gen.schema Comments.UserVote user_votes user_id:references:users comment_id:references:comments vote_type:string --binary-id",
  "Create user vote schema"
)
pause()

step(16, "Create Report Schema")
command(
  "mix phx.gen.context Moderation Report reports reporter_id:references:users reported_user_id:references:users reason:text status:string resolved_by_id:references:users --binary-id",
  "Create report context"
)
pause()

step(17, "Create UserMetrics Schema")
command(
  "mix phx.gen.schema Metrics.UserMetrics user_metrics user_id:references:users puzzles_solved:integer puzzles_attempted:integer total_submissions:integer rating:integer rank:integer --binary-id",
  "Create metrics schema"
)
pause()

step(18, "Run All Migrations")
command("mix ecto.migrate", "Apply all database migrations")
success("Database schema created!")
pause()

step(19, "Create Authentication Controllers")
info("Create: lib/codincod_api_web/controllers/auth_controller.ex")
IO.puts """
   Implement endpoints:
   - register/2
   - login/2
   - logout/2
   - refresh/2
   - current_user/2
"""
pause()

step(20, "Create Routes")
info("Edit: lib/codincod_api_web/router.ex")
IO.puts """
   Add routes:

   scope "/api", CodincodApiWeb do
     pipe_through :api

     # Public routes
     post "/register", AuthController, :register
     post "/login", AuthController, :login

     # Protected routes
     pipe_through :auth
     post "/logout", AuthController, :logout
     get "/user", AuthController, :current_user
     # ... more routes
   end
"""
pause()

step(21, "Create Phoenix Channels")
command("mkdir -p lib/codincod_api_web/channels", "Create channels directory")
info("Create WaitingRoomChannel and GameChannel")
pause()

step(22, "Implement Piston Client")
info("Create: lib/codincod_api/piston/client.ex")
IO.puts """
   Use Tesla/Finch to communicate with Piston API:

   defmodule CodincodApi.Piston.Client do
     use Tesla

     plug Tesla.Middleware.BaseUrl, Application.get_env(:codincod_api, :piston)[:base_url]
     plug Tesla.Middleware.JSON

     def execute(code, language, version) do
       post("/execute", %{
         language: language,
         version: version,
         files: [%{content: code}]
       })
     end
   end
"""
pause()

step(23, "Create Oban Workers")
info("Create background job workers:")
IO.puts """
   - lib/codincod_api/workers/execute_submission.ex
   - lib/codincod_api/workers/update_statistics.ex
   - lib/codincod_api/workers/recalculate_leaderboard.ex
   - lib/codincod_api/workers/send_email.ex
"""
pause()

step(24, "Implement Data Migration")
info("Create: lib/codincod_api/data_migration.ex")
IO.puts """
   Implement functions:
   - migrate_all/0
   - migrate_users/0
   - migrate_puzzles/0
   - migrate_submissions/0
   - migrate_games/0
   - validate_migration/0
"""
pause()

step(25, "Create Mix Tasks")
info("Create migration mix tasks:")
command("touch lib/mix/tasks/migrate_mongo.ex", "Create migration task")
command("touch lib/mix/tasks/gen_typescript_types.ex", "Create type gen task")
pause()

step(26, "Implement TypeScript Type Generator")
info("Generate TypeScript types from Ecto schemas for frontend")
pause()

step(27, "Write Tests")
info("Create comprehensive tests:")
IO.puts """
   Unit Tests:
   - test/codincod_api/accounts_test.exs
   - test/codincod_api/puzzles_test.exs
   - test/codincod_api/submissions_test.exs
   - test/codincod_api/games_test.exs

   Integration Tests:
   - test/codincod_api_web/controllers/*_test.exs

   Channel Tests:
   - test/codincod_api_web/channels/*_test.exs
"""
pause()

step(28, "Configure CORS & Security")
info("Edit: lib/codincod_api_web/endpoint.ex")
IO.puts """
   Add CORS plug:

   plug CORSPlug,
     origin: ~r/^https?:\/\/(localhost:5173|codincod\.com)$/,
     credentials: true
"""
pause()

step(29, "Add Rate Limiting")
info("Create rate limiting plugs")
pause()

step(30, "Create Health Check Endpoint")
command("mix phx.gen.json Health Check checks --no-context --no-schema", "Generate health controller")
pause()

step(31, "Seed Database")
info("Edit: priv/repo/seeds.exs")
IO.puts """
   Create seed data:
   - Admin user
   - Sample users (10-20)
   - Programming languages
   - Sample puzzles (20-30)
   - Sample submissions
"""
command("mix run priv/repo/seeds.exs", "Run seeds")
pause()

step(32, "Run Data Migration")
warn("Ensure MongoDB is running with legacy data")
command("mix migrate_mongo", "Migrate data from MongoDB")
command("mix migrate_mongo --validate", "Validate migration")
pause()

step(33, "Generate TypeScript Types")
command("mix gen_typescript_types", "Generate TypeScript types for frontend")
pause()

step(34, "Run All Tests")
command("mix test", "Run test suite")
command("mix test --cover", "Check test coverage")
pause()

step(35, "Performance Testing")
info("Test performance with:")
IO.puts """
   - Load testing tools (wrk, Apache Bench)
   - Concurrent WebSocket connections
   - Database query optimization
   - N+1 query detection
"""
pause()

step(36, "Production Configuration")
info("Configure for production:")
IO.puts """
   - Set environment variables
   - Configure SSL
   - Set up error tracking (Sentry)
   - Configure CDN
   - Set up monitoring
"""
pause()

step(37, "Documentation")
info("Update documentation:")
IO.puts """
   - API documentation (OpenAPI/Swagger)
   - WebSocket event documentation
   - Deployment guide
   - Runbook for operations
"""
pause()

step(38, "Deployment")
info("Deploy to production:")
IO.puts """
   Option A: Docker
   $ docker build -t codincod-api:latest .
   $ docker push codincod-api:latest

   Option B: Mix Release
   $ MIX_ENV=prod mix release
   $ _build/prod/rel/codincod_api/bin/codincod_api start

   Option C: Fly.io / Gigalixir / Render
   Follow platform-specific deployment guides
"""
pause()

success("Migration Steps Complete!")

IO.puts """

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                     🎉 Migration Guide Complete! 🎉                     ║
║                                                                          ║
║  You have completed all the steps for migrating the CodinCod backend    ║
║  from TypeScript/MongoDB to Elixir/PostgreSQL.                          ║
║                                                                          ║
║  Next Steps:                                                             ║
║  1. Verify all tests pass                                               ║
║  2. Performance test the application                                     ║
║  3. Update frontend to use new backend                                   ║
║  4. Deploy to staging environment                                        ║
║  5. Monitor and optimize                                                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

For detailed information, see:
- MIGRATION_GUIDE.md - Comprehensive migration guide
- README.md - Project documentation
- STATUS.md - Current status and next steps
- WINDOWS_SETUP.md - Windows-specific setup

Good luck with your migration! 🚀
"""
