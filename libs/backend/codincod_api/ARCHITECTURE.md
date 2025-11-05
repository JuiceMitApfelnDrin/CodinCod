# CodinCod Elixir Backend Architecture Plan

This document translates the current Fastify/MongoDB backend into Phoenix/Ecto building blocks. It is derived from the live TypeScript codebase (`libs/backend`) and does not rely on the legacy migration draft.

## High-Level Overview

- **Runtime:** Phoenix 1.8 (API-only) with Bandit.
- **Persistence:** PostgreSQL 16 via Ecto with UUID primary keys.
- **Auth & Sessions:** Guardian JWT pipeline, stateless cookies for the frontend.
- **Realtime:** Phoenix Channels for waiting room and in-game events.
- **Background Work:** Oban queues for code execution, leaderboard recomputes, and moderation notifications.
- **External Services:** Piston HTTP API for code execution.
- **Type Interop:** Automated TypeScript type export for request/response DTOs and persisted schemas.

## Domain Contexts

| Context | Responsibilities | References in TS backend |
| --- | --- | --- |
| `CodincodApi.Accounts` | User CRUD, registration, credential verification, ban tracking | `models/user`, `services/user.service.ts`, `routes/login`, `routes/register`, `routes/user` |
| `CodincodApi.Accounts.Preferences` | Editor/UX settings, blocked users, preferred language | `models/preferences`, `routes/account/preferences` |
| `CodincodApi.Auth` | Guardian integration, cookie/session helpers, rate limit overlays | `plugins/config/jwt.ts`, `utils/functions/generate-token.ts` |
| `CodincodApi.Puzzles` | Puzzle authoring, publishing workflow, validator management, metrics | `models/puzzle`, `services/puzzle.service.ts`, `routes/puzzle/**`, `routes/moderation/puzzle/**` |
| `CodincodApi.Submissions` | User submissions, result storage, piston dispatch, puzzle/game linking | `models/submission`, `routes/submission/**`, `services/submission.service.ts` |
| `CodincodApi.Languages` | Supported programming languages and versions | `models/programming-language`, `routes/programming-language` |
| `CodincodApi.Comments` | Nested comment threads, votes, moderation flags | `models/comment`, `routes/comment/**` |
| `CodincodApi.Chat` | Game chat persistence and moderation | `models/chat`, `websocket/game`, `routes/report` |
| `CodincodApi.Games` | Waiting rooms, matchmaking, game state lifecycle | `websocket/waiting-room`, `websocket/game`, `services/game.service.ts`, `routes/submission/game` |
| `CodincodApi.Leaderboard` | Metrics aggregation, hourly cron rebuild, admin recalculation endpoint | `services/leaderboard.service.ts`, `routes/leaderboard/**`, `config/cron.ts` |
| `CodincodApi.Moderation` | Reports, review queue, bans, puzzle approvals | `models/moderation/**`, `routes/moderation/**`, `routes/report` |
| `CodincodApi.Execute` | REST proxy to Piston, runtime cache | `routes/execute`, `plugins/decorators/piston.ts` |
| `CodincodApi.Migration` | Mongo -> Postgres data import tooling | `scripts/migration_attempt.md`, direct access to Mongo collections |

Each context will expose a boundary module (e.g., `CodincodApi.Puzzles`) with public functions that align with the service layer in the TypeScript backend.

## Data Model Plan

Tables use snake_case; Ecto schemas expose camelCase fields where the API contracts require them.

### Core Entities

- `users`
  - `username` (citext, unique), `email` (citext, unique), `password_hash`, `profile` (jsonb), `role` (enum), `report_count`, `ban_count`
  - `current_ban_id` FK → `user_bans`

- `user_bans`
  - `user_id`, `banned_by_id`, `reason`, `ban_type` (`temporary`/`permanent`), `expires_at`, `metadata`

- `preferences`
  - `user_id` (unique FK), `blocked_user_ids` (uuid[]), `theme`, `preferred_language_id`, `editor` (jsonb)

- `programming_languages`
  - Aligned with `ProgrammingLanguageEntity` (name, slug, version, runtime key, aliases, is_active)

- `puzzles`
  - `author_id`, `title`, `statement`, `constraints`, `difficulty`, `visibility`, `solution` (jsonb), `tags` (text[]), `metrics_id`
  - `validators` stored in `puzzle_validators`

- `puzzle_validators`
  - `puzzle_id`, `name`, `description`, `input`, `output`, `is_public`

- `puzzle_metrics`
  - `puzzle_id`, `attempt_count`, `success_count`, `avg_execution_ms`

- `submissions`
  - `puzzle_id`, `user_id`, `game_id`, `language_id`, `code`, `result` (jsonb), `status`, execution metadata

- `games`
  - `owner_id`, `puzzle_id`, `options` (jsonb), `visibility`, `state`, `started_at`, `ended_at`

- `game_players`
  - Join table: `game_id`, `user_id`, `joined_at`, `submission_id`, `score`

- `chat_messages`
  - `game_id`, `user_id`, `username_snapshot`, `message`, `is_deleted`

- `comments`
  - `author_id`, `commentable_type` (`puzzle`/`submission`), `commentable_id`, `body`, `comment_type`, `upvotes`, `downvotes`, `parent_id`

- `comment_votes`
  - `comment_id`, `user_id`, `vote_type`

- `reports`
  - `reported_user_id`, `reporter_id`, `reason`, `status`, `payload`, `resolved_by_id`

- `moderation_reviews`
  - `puzzle_id`, `reviewer_id`, `status`, `notes`

- `user_metrics`
  - `user_id`, `rating`, `rank`, `puzzles_solved`, `puzzles_attempted`, `win_rate`, `streak`

- `leaderboard_snapshots`
  - `game_mode`, `captured_at`, `entries` (array of user metrics slice)

### Supporting Tables

- `api_keys` (service-to-service auth, future use)
- `audit_logs` (record sensitive moderation/admin actions)
- `legacy_ids` (maps Mongo `_id` to new UUID for migration idempotency)

## REST API Mapping

Routers will be structured under `CodincodApiWeb.Router` as:

```
scope "/api" do
  pipe_through [:api, :rate_limit]

  post "/register", AuthController, :register
  post "/login", AuthController, :login
  post "/logout", AuthController, :logout
  post "/refresh", AuthController, :refresh

  scope "/user" do
    pipe_through [:jwt_optional]
    get "/:username", UserController, :show_by_username
    get "/:username/activity", UserController, :activity
    get "/:username/puzzle", UserController, :puzzles
    get "/:username/isAvailable", UserController, :is_available
  end

  scope "/account" do
    pipe_through [:jwt_required]
    get "/preferences", AccountController, :preferences
    put "/preferences", AccountController, :update_preferences
  end

  resources "/puzzle", PuzzleController, except: [:new, :edit]
  resources "/submission", SubmissionController, only: [:index, :create, :show]

  post "/submission/game", GameSubmissionController, :create
  get "/execute", ExecuteController, :show

  resources "/comment", CommentController, only: [:show, :update, :delete]
  post "/comment/:id/comment", CommentController, :reply
  post "/comment/:id/vote", CommentVoteController, :vote

  resources "/programming-language", ProgrammingLanguageController, only: [:index, :show]

  scope "/leaderboard" do
    get "/:game_mode", LeaderboardController, :show
    get "/user/:id", LeaderboardController, :user
    post "/recalculate", LeaderboardController, :recalculate
  end

  scope "/moderation" do
    pipe_through [:jwt_required, :ensure_moderator]
    # Approvals, bans, reports
  end

  get "/health", HealthController, :index
end
```

## Phoenix Channels

- **WaitingRoomChannel** (`"waiting_room:lobby"`)
  - events: `room:host`, `room:join`, `room:leave`, `rooms:overview`, `game:start`
  - backed by `CodincodApi.Games.WaitingRoomRegistry` (Registry + DynamicSupervisor)

- **GameChannel** (`"game:" <> game_id`)
  - events: `game:join`, `game:leave`, `game:submit`, `player:submitted`, `chat:message`, `game:update`
  - backed by per-game GenServers tracking state and timers

## Background Processing

Oban queues and workers:

- `CodincodApi.Workers.ExecuteSubmission` → dispatches to Piston, updates submission result
- `CodincodApi.Workers.UpdatePuzzleMetrics` → updates puzzle stats after submission
- `CodincodApi.Workers.UpdateUserMetrics` → updates ELO / streak metrics
- `CodincodApi.Workers.LeaderboardRecalculate` → scheduled hourly instead of node-cron
- `CodincodApi.Workers.ProcessReport` → asynchronous moderation notifications

## TypeScript Type Generation

- Implementation module `CodincodApi.Typegen` will introspect Ecto schemas and API view definitions to output `.d.ts`/`.ts` into `libs/types/src/elixir-generated.ts`.
- Exports will include:
  - Schema DTOs (User, Puzzle, Submission, Comment, Game, LeaderboardEntry, Report)
  - API route payloads (request/response bodies) respecting Zod contracts currently used by the frontend
  - Enum exports for roles, difficulties, visibilities, ban types, etc.
- Generation triggered via `mix codincod.gen_types --dest ../../types/src/elixir-generated.ts`.

## Migration Strategy

- Create migrations partitioned by domain (`2025xxxx_create_accounts.exs`, `..._puzzles.exs`, etc.) with explicit indexes reflecting Mongo usage (e.g., `users.username` unique, `puzzles.tags` gin index).
- Populate `legacy_ids` and `*_legacy_id` columns to allow idempotent Mongo import.
- Provide mix tasks `mix codincod.migrate_legacy users|puzzles|all`.

## Testing Plan

- Context-level unit tests for each public boundary.
- Controller tests using JSON API assertions mirroring Fastify behavior.
- Channel tests for WebSocket events (join, broadcast, game transitions).
- Integration tests for auth flows, leaderboard recalculation, moderation approvals.

## Deployment Notes

- Replace node cron with Oban Cron plugin (hourly leaderboard job).
- Rate limiting enforced via `Hammer.Plug` in router pipeline and `Guardian` for authentication.
- Security headers replicated using Plug-based configuration.

This plan will guide the actual implementation files and ensure feature parity with the existing TypeScript backend.
