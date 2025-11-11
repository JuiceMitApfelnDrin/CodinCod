# CodinCod Application Architecture

**Version:** 1.0  
**Last Updated:** November 11, 2025  
**Status:** Migration to Elixir/Phoenix in progress

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Layers](#architecture-layers)
4. [Core Components](#core-components)
5. [Data Models & Database Schema](#data-models--database-schema)
6. [Communication Patterns](#communication-patterns)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-Time Multiplayer System](#real-time-multiplayer-system)
9. [Code Execution Pipeline](#code-execution-pipeline)
10. [Frontend Architecture](#frontend-architecture)
11. [Technology Stack](#technology-stack)
12. [Deployment Architecture](#deployment-architecture)
13. [Security Model](#security-model)
14. [Performance Considerations](#performance-considerations)

---

## Executive Summary

CodinCod is a **modern coding challenge platform** that combines **single-player puzzle solving** with **real-time multiplayer competition**. The platform enables developers to improve their skills through gamified challenges in 20+ programming languages.

### Key Characteristics

- **Architecture Pattern**: Monorepo with separate frontend/backend packages
- **Migration Status**: Moving from Node.js/MongoDB to Elixir/Phoenix/PostgreSQL
- **Primary Languages**: Elixir (backend), TypeScript (frontend), SQL (database)
- **Real-Time Communication**: Phoenix Channels (WebSocket-based)
- **Code Execution**: Piston API (sandboxed execution)
- **Deployment Model**: Containerized services (Docker)

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CODINCOD PLATFORM                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Frontend   │  │   Backend    │  │  External    │
        │  (SvelteKit) │  │   (Phoenix)  │  │  Services    │
        │              │  │              │  │              │
        │  Port: 5173  │  │  Port: 4000  │  │  - Piston    │
        └──────────────┘  └──────────────┘  │  - SMTP      │
                │                 │          └──────────────┘
                │                 │
                └────────┬────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   PostgreSQL     │
                │   Database       │
                │   Port: 5432     │
                └──────────────────┘
```

### Component Interactions

```
User Browser                 Frontend SPA              Backend API
     │                            │                         │
     │  1. HTTP Request           │                         │
     ├───────────────────────────>│                         │
     │                            │  2. SSR/Hydration       │
     │  3. HTML Response          │                         │
     │<───────────────────────────┤                         │
     │                            │                         │
     │  4. API Request (REST)     │                         │
     │<──────────────────────────>│  5. HTTP Request        │
     │                            ├────────────────────────>│
     │                            │  6. Database Query      │
     │                            │         │               │
     │                            │         ▼               │
     │                            │    PostgreSQL           │
     │                            │         │               │
     │                            │  7. Response            │
     │<──────────────────────────┤<────────────────────────┤
     │                            │                         │
     │  8. WebSocket Connect      │                         │
     │<═══════════════════════════╪═══════════════════════>│
     │     Phoenix Channel        │   (Real-time events)    │
     │                            │                         │
```

---

## Architecture Layers

### Layer Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Frontend)                              │
│  • SvelteKit Pages & Components                             │
│  • State Management (Svelte Stores)                         │
│  • CodeMirror Editor Integration                            │
│  • WebSocket Client (Phoenix.js)                            │
└─────────────────────────────────────────────────────────────┘
                         │ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│  API LAYER (Phoenix Controllers & Channels)                 │
│  • REST Endpoints (/api/*)                                  │
│  • Phoenix Channels (WebSocket)                             │
│  • Authentication Middleware                                │
│  • Request Validation (OpenAPI)                             │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Context Modules)                     │
│  • Accounts (Users, Auth, Preferences)                      │
│  • Puzzles (Creation, Validation, Metrics)                  │
│  • Games (Multiplayer Sessions)                             │
│  • Submissions (Code Execution Results)                     │
│  • Moderation (Reports, Reviews, Bans)                      │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│  DATA ACCESS LAYER (Ecto)                                   │
│  • Schema Definitions                                       │
│  • Changesets & Validations                                 │
│  • Queries & Preloading                                     │
│  • Migrations                                               │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│  DATABASE LAYER (PostgreSQL)                                │
│  • Users, Puzzles, Games, Submissions                       │
│  • Indexes, Constraints, Extensions                         │
│  • JSONB for flexible data                                  │
└─────────────────────────────────────────────────────────────┘
```

### Cross-Cutting Concerns

```
┌─────────────────────────────────────────────────────────────┐
│  SHARED INFRASTRUCTURE                                      │
│  • Authentication (Guardian JWT)                            │
│  • Logging & Telemetry (Phoenix Telemetry)                  │
│  • Error Handling (Phoenix ErrorView)                       │
│  • Rate Limiting (Plugs)                                    │
│  • CORS Configuration                                       │
│  • Email Service (Swoosh)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Backend Components (Elixir/Phoenix)

#### 1. **Phoenix Endpoint** (`endpoint.ex`)

- Entry point for all HTTP/WebSocket connections
- Handles request parsing, logging, static files
- Manages socket connections for channels

#### 2. **Router** (`router.ex`)

Three pipeline configurations:

- **`:api`** - Public endpoints (no auth required)
- **`:maybe_auth`** - Optional authentication
- **`:auth`** - Protected endpoints (JWT required)

#### 3. **Context Modules** (Business Logic)

```elixir
# Context Pattern Example
CodincodApi.Accounts
  ├── accounts.ex          # Public API functions
  ├── user.ex             # Schema
  ├── preference.ex       # Schema
  ├── user_ban.ex         # Schema
  └── password_reset.ex   # Schema

CodincodApi.Games
  ├── games.ex            # Public API functions
  ├── game.ex             # Schema
  └── game_player.ex      # Schema

CodincodApi.Puzzles
  ├── puzzles.ex          # Public API functions
  ├── puzzle.ex           # Schema
  ├── puzzle_test_case.ex # Schema
  ├── puzzle_example.ex   # Schema
  └── puzzle_validator.ex # Schema
```

**Context Functions (Examples):**

```elixir
# Accounts context
Accounts.create_user(attrs)
Accounts.fetch_user(id)
Accounts.update_profile(user, attrs)
Accounts.ban_user(user, reason)

# Games context
Games.create_game(attrs)
Games.add_player_to_game(game, user)
Games.start_game(game)
Games.submit_code(game, player, code)

# Puzzles context
Puzzles.create_puzzle(attrs)
Puzzles.list_puzzles(filters)
Puzzles.validate_solution(puzzle, code, language)
```

#### 4. **Phoenix Channels** (Real-Time)

```elixir
# Channel Architecture
CodincodApiWeb.UserSocket
  ├── waiting_room:lobby        # Browse available rooms
  ├── waiting_room:{room_id}    # Specific waiting room
  └── game:{game_id}            # Active game session
```

**Channel Events:**

```elixir
# Waiting Room Channel
"host_room"       → Create new room
"join_room"       → Join existing room
"leave_room"      → Leave room
"start_game"      → Initiate game start
"chat_message"    → Send chat message

# Game Channel
"code_update"     → Broadcast code changes
"submit_code"     → Execute and submit solution
"player_online"   → Player presence
"game_completed"  → Game finished
```

#### 5. **Authentication System** (Guardian)

```elixir
# JWT Token Flow
1. User logs in → AuthController.login/2
2. Generate JWT → Guardian.encode_and_sign(user)
3. Set HTTP-only cookie with token
4. Subsequent requests → Plug.AttachTokenFromCookie
5. Verify token → Guardian.Plug.VerifyHeader
6. Load user → Guardian.Plug.LoadResource
7. Attach to conn → Plug.CurrentUser
```

#### 6. **Piston Integration** (Code Execution)

```elixir
# Piston Client Module
CodincodApi.Piston
  ├── list_runtimes()     # Get available languages
  └── execute(request)    # Run user code

# Execution Request
%{
  language: "python",
  version: "3.10.0",
  files: [%{content: "print('Hello')"}],
  stdin: "",
  args: [],
  compile_timeout: 10000,
  run_timeout: 3000,
  compile_memory_limit: -1,
  run_memory_limit: -1
}
```

### Frontend Components (SvelteKit/TypeScript)

#### 1. **Route Structure**

```
routes/
├── (authenticated)/
│   ├── multiplayer/
│   │   ├── +page.svelte          # Lobby/waiting room
│   │   └── [id]/+page.svelte     # Active game
│   ├── puzzles/
│   │   ├── +page.svelte          # Puzzle list
│   │   ├── create/+page.svelte   # Create puzzle
│   │   └── [id]/
│   │       ├── +page.svelte      # View puzzle
│   │       ├── play/+page.svelte # Solve puzzle
│   │       └── edit/+page.svelte # Edit puzzle
│   ├── settings/+page.svelte     # User settings
│   └── profile/[username]/+page.svelte
│
├── (unauthenticated-only)/
│   ├── login/+page.svelte
│   └── register/+page.svelte
│
├── leaderboards/+page.svelte
└── +page.svelte                  # Home page
```

#### 2. **State Management**

```typescript
// Svelte Stores Pattern
stores/
├── auth.store.ts           # User authentication state
├── puzzle.store.ts         # Current puzzle data
├── game.store.ts           # Multiplayer game state
├── preferences.store.ts    # User preferences
└── notifications.store.ts  # Toast notifications

// Usage Example
import { authStore } from '@/stores/auth.store';

// Reactive subscription in component
$: currentUser = $authStore.user;
$: isAuthenticated = $authStore.isAuthenticated;
```

#### 3. **WebSocket Management**

```typescript
// Phoenix Socket Manager
class PhoenixSocketManager<TPayload, TResponse> {
	private socket: Socket | null = null;
	private channel: Channel | null = null;

	async connect(): Promise<void>;
	async joinChannel(): Promise<void>;
	send(event: string, payload: TPayload): void;
	on(event: string, handler: (payload: TResponse) => void): void;
	destroy(): void;
}

// Usage in Components
const wsManager = new PhoenixSocketManager({
	url: "ws://localhost:4000/socket",
	topic: "waiting_room:lobby",
	onMessage: handleMessage,
	onStateChange: handleStateChange
});

await wsManager.connect();
wsManager.send("host_room", { mode: "FASTEST", puzzle_id: "..." });
```

#### 4. **Component Architecture**

```
lib/components/
├── ui/                    # Base UI components
│   ├── button/
│   ├── input/
│   ├── card/
│   └── dialog/
│
├── features/              # Feature-specific components
│   ├── authentication/
│   │   ├── login-form.svelte
│   │   └── register-form.svelte
│   ├── puzzles/
│   │   ├── puzzle-card.svelte
│   │   ├── puzzle-editor.svelte
│   │   └── test-case-runner.svelte
│   └── multiplayer/
│       ├── waiting-room.svelte
│       ├── player-list.svelte
│       └── game-timer.svelte
│
└── layout/                # Layout components
    ├── navbar.svelte
    ├── sidebar.svelte
    └── footer.svelte
```

---

## Data Models & Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │◄───────┤  User Bans   │         │ Preferences │
│             │ 1     * │              │         │             │
│ • id        │         │ • id         │         │ • id        │
│ • username  │         │ • user_id    │    ┌───►│ • user_id   │
│ • email     │         │ • reason     │    │    │ • theme     │
│ • password  │         │ • banned_by  │    │    │ • editor    │
│ • profile   │         │ • expires_at │    │    └─────────────┘
│ • role      │         └──────────────┘    │
└──────┬──────┘                             │
       │ 1                                  │ 1
       │                                    │
       │ *                        ┌─────────┘
       │                          │
       │     ┌─────────────┐      │    ┌─────────────────┐
       └────►│   Puzzles   │◄─────┼───►│ Puzzle Metrics  │
       author│             │ 1    │ 1  │                 │
             │ • id        │      │    │ • puzzle_id     │
             │ • title     │      │    │ • attempt_count │
             │ • statement │      │    │ • success_count │
             │ • difficulty│      │    │ • avg_exec_ms   │
             │ • tags      │      │    └─────────────────┘
             │ • visibility│      │
             └──────┬──────┘      │
                 1  │             │
                    │ *           │
          ┌─────────┴──────┐     │    ┌──────────────────┐
          │                │     └───►│ Test Cases       │
     ┌────┤                │          │                  │
     │    │                │     1  * │ • puzzle_id      │
     │    │                │     ┌───►│ • input          │
     │    │                │     │    │ • output         │
     │    │                │     │    │ • is_public      │
     │    │                │     │    └──────────────────┐
     │    │                │     │                        │
     │ ┌──┴──────────┐    │     │    ┌──────────────────┤
     │ │   Games     │◄───┤     │    │ Puzzle Examples  │
     │ │             │ 1  │     │    │                  │
     │ │ • id        │    │     └───►│ • puzzle_id      │
     │ │ • owner_id  │────┘          │ • title          │
     │ │ • puzzle_id │               │ • input          │
     │ │ • mode      │               │ • expected_output│
     │ │ • status    │               └──────────────────┘
     │ │ • started_at│
     │ └──────┬──────┘
     │        │ 1
     │        │
     │        │ *
     │ ┌──────┴───────────┐
     │ │  Game Players    │
     │ │                  │
     └►│ • game_id        │
       │ • user_id        │
       │ • joined_at      │
       │ • score          │
       │ • placement      │
       └──────────────────┘

┌─────────────────┐         ┌──────────────────┐
│  Submissions    │         │    Comments      │
│                 │         │                  │
│ • id            │         │ • id             │
│ • user_id       │─────┐   │ • puzzle_id      │
│ • puzzle_id     │     │   │ • author_id      │
│ • game_id       │     └──►│ • content        │
│ • code          │         │ • vote_count     │
│ • language      │         └──────────────────┘
│ • execution_time│
│ • passed        │         ┌──────────────────┐
│ • output        │         │    Reports       │
└─────────────────┘         │                  │
                            │ • id             │
                            │ • reporter_id    │
                            │ • reported_type  │
                            │ • reported_id    │
                            │ • reason         │
                            │ • status         │
                            └──────────────────┘
```

### Core Tables Deep Dive

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  profile JSONB DEFAULT '{}',
  role VARCHAR DEFAULT 'user',
  report_count INTEGER DEFAULT 0,
  ban_count INTEGER DEFAULT 0,
  current_ban_id UUID REFERENCES user_bans(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Profile JSONB structure
{
  "bio": "Software engineer interested in algorithms",
  "location": "San Francisco, CA",
  "website": "https://example.com",
  "github": "username",
  "twitter": "username",
  "skills": ["Python", "JavaScript", "Elixir"]
}
```

**Indexes:**

- `UNIQUE INDEX ON (username)` - Fast username lookups
- `UNIQUE INDEX ON (email)` - Fast email lookups
- `INDEX ON (role)` - Filter by role
- `INDEX ON (inserted_at)` - Sort by join date

#### Puzzles Table

```sql
CREATE TABLE puzzles (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  statement TEXT,
  constraints TEXT,
  author_id UUID REFERENCES users(id) NOT NULL,
  difficulty VARCHAR NOT NULL,
  visibility VARCHAR NOT NULL,
  tags VARCHAR[] DEFAULT '{}',
  solution JSONB DEFAULT '{}',
  moderation_feedback TEXT,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,

  CONSTRAINT difficulty_check CHECK (
    difficulty IN ('BEGINNER', 'EASY', 'INTERMEDIATE',
                   'ADVANCED', 'HARD', 'EXPERT')
  ),
  CONSTRAINT visibility_check CHECK (
    visibility IN ('DRAFT', 'READY', 'REVIEW',
                   'REVISE', 'APPROVED', 'INACTIVE', 'ARCHIVED')
  )
);
```

**Indexes:**

- `INDEX ON (author_id)` - Puzzles by author
- `INDEX ON (difficulty)` - Filter by difficulty
- `INDEX ON (visibility)` - Filter by visibility
- `GIN INDEX ON (tags)` - Fast tag search

#### Games Table

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id) NOT NULL,
  puzzle_id UUID REFERENCES puzzles(id) NOT NULL,
  visibility VARCHAR NOT NULL,          -- 'public', 'private', 'friends'
  mode VARCHAR NOT NULL,                -- Game mode
  rated BOOLEAN DEFAULT true,
  status VARCHAR DEFAULT 'waiting',     -- 'waiting', 'in_progress', 'completed'
  max_duration_seconds INTEGER DEFAULT 600,
  allowed_language_ids UUID[] DEFAULT '{}',
  options JSONB DEFAULT '{}',
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

**Game Modes:**

- `FASTEST` - First to solve wins
- `SHORTEST` - Shortest code wins
- `BACKWARDS` - Write code that reads backwards
- `HARDCORE` - No test cases shown
- `DEBUG` - Fix broken code
- `TYPERACER` - Type existing code quickly
- `EFFICIENCY` - Best time complexity
- `INCREMENTAL` - Solve step-by-step
- `RANDOM` - Random mode each round

#### Submissions Table

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  puzzle_id UUID REFERENCES puzzles(id) NOT NULL,
  game_id UUID REFERENCES games(id),
  code TEXT NOT NULL,
  language VARCHAR NOT NULL,
  execution_time_ms INTEGER,
  memory_usage_kb INTEGER,
  passed BOOLEAN,
  test_results JSONB,
  output TEXT,
  inserted_at TIMESTAMP NOT NULL
);
```

---

## Communication Patterns

### REST API Communication

```
Frontend                           Backend
   │                                  │
   │  POST /api/register              │
   │  {username, email, password}     │
   ├─────────────────────────────────>│
   │                                  │ Validate input
   │                                  │ Hash password
   │                                  │ Insert to DB
   │                                  │ Generate JWT
   │  201 Created                     │
   │  {user, token}                   │
   │<─────────────────────────────────┤
   │                                  │
   │  GET /api/puzzles?difficulty=EASY│
   ├─────────────────────────────────>│
   │                                  │ Query database
   │                                  │ Apply filters
   │  200 OK                          │
   │  {puzzles: [...], total: 45}     │
   │<─────────────────────────────────┤
```

### WebSocket Communication (Phoenix Channels)

```
Client                     Phoenix Channel              Database
  │                              │                          │
  │  1. Connect Socket           │                          │
  ├─────────────────────────────>│                          │
  │  ws://host/socket            │                          │
  │  {token: "jwt..."}           │  Verify JWT              │
  │                              │  Authenticate            │
  │  2. Connected                │                          │
  │<─────────────────────────────┤                          │
  │                              │                          │
  │  3. Join Channel             │                          │
  │  {channel: "waiting_room"}   │                          │
  ├─────────────────────────────>│                          │
  │                              │  Authorization check     │
  │                              ├─────────────────────────>│
  │                              │  Fetch game state        │
  │                              │<─────────────────────────┤
  │  4. Joined                   │                          │
  │  {room: {...}}               │                          │
  │<─────────────────────────────┤                          │
  │                              │                          │
  │  5. Send Event               │                          │
  │  {event: "host_room"}        │                          │
  ├─────────────────────────────>│                          │
  │                              │  Create game             │
  │                              ├─────────────────────────>│
  │                              │<─────────────────────────┤
  │                              │                          │
  │                              │  Broadcast to all        │
  │  6. Broadcast Event          │  clients in channel      │
  │  {event: "room_created"}     │                          │
  │<═════════════════════════════╪══════════════════════════│
  │                              │                          │
```

### Channel Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│  PHOENIX CHANNEL LIFECYCLE                                 │
└────────────────────────────────────────────────────────────┘

1. Socket Connection
   ├─ Client opens WebSocket connection
   ├─ Phoenix UserSocket.connect/3 validates token
   └─ Returns {:ok, socket} or {:error, reason}

2. Channel Join
   ├─ Client sends join message with topic
   ├─ Channel.join/3 authorizes user
   ├─ Channel sends :after_join message to self
   └─ Returns {:ok, reply, socket} or {:error, reason}

3. Message Handling
   ├─ handle_in/3 - Incoming from client
   ├─ handle_out/3 - Outgoing to client
   ├─ handle_info/2 - Internal messages
   └─ broadcast!/3 - Send to all in channel

4. Channel Leave
   ├─ Client sends leave message
   ├─ Channel.terminate/2 cleanup
   └─ Remove from presence tracking

5. Socket Disconnect
   ├─ WebSocket closes
   ├─ All channels terminated
   └─ Resources cleaned up
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  REGISTRATION & LOGIN FLOW                                  │
└─────────────────────────────────────────────────────────────┘

REGISTRATION:
  1. User submits form → POST /api/register
  2. Backend validates input (length, format, uniqueness)
  3. Hash password with Bcrypt (cost: 12)
  4. Insert user into database
  5. Generate JWT token with Guardian
  6. Set HTTP-only cookie with token
  7. Return user data (exclude password_hash)

LOGIN:
  1. User submits credentials → POST /api/login
  2. Fetch user by username/email
  3. Verify password with Bcrypt.verify_pass
  4. Generate JWT token
  5. Set HTTP-only cookie
  6. Return user data

AUTHENTICATED REQUEST:
  1. Browser sends request with cookie
  2. Plug.AttachTokenFromCookie extracts token
  3. Guardian.Plug.VerifyHeader validates JWT
  4. Guardian.Plug.LoadResource loads user from DB
  5. Plug.CurrentUser attaches user to conn
  6. Controller accesses via conn.assigns.current_user
```

### JWT Token Structure

```elixir
# Token Claims
%{
  "sub" => "user:#{user.id}",           # Subject (user ID)
  "typ" => "access",                    # Token type
  "aud" => "codincod_api",              # Audience
  "iss" => "codincod_api",              # Issuer
  "iat" => 1699747200,                  # Issued at
  "exp" => 1699833600,                  # Expires at (24h)
  "jti" => "uuid-v4",                   # JWT ID
  "username" => "john_doe",             # Custom claim
  "role" => "user"                      # Custom claim
}

# Signed with secret from config
# Algorithm: HS256 (HMAC with SHA-256)
```

### Authorization Levels

```elixir
# Role Hierarchy
defmodule CodincodApi.Accounts.Role do
  @roles %{
    "user" => 0,
    "moderator" => 1,
    "admin" => 2
  }

  def can?(user, required_role) do
    @roles[user.role] >= @roles[required_role]
  end
end

# Usage in Controllers
def delete_comment(conn, %{"id" => id}) do
  current_user = conn.assigns.current_user
  comment = Comments.get_comment!(id)

  cond do
    comment.author_id == current_user.id ->
      # User can delete their own comments
      Comments.delete_comment(comment)

    Accounts.Role.can?(current_user, "moderator") ->
      # Moderators can delete any comment
      Comments.delete_comment(comment)

    true ->
      # Forbidden
      {:error, :forbidden}
  end
end
```

### WebSocket Authentication

```elixir
# UserSocket authentication
defmodule CodincodApiWeb.UserSocket do
  use Phoenix.Socket

  def connect(%{"token" => token}, socket, _connect_info) do
    case Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        user_id = claims["sub"]
        {:ok, assign(socket, :user_id, user_id)}

      {:error, _reason} ->
        :error
    end
  end

  # Fallback: no token provided
  def connect(_params, _socket, _connect_info), do: :error
end
```

---

## Real-Time Multiplayer System

### Two-Level Channel Architecture

```
┌────────────────────────────────────────────────────────────┐
│  MULTIPLAYER CHANNEL HIERARCHY                             │
└────────────────────────────────────────────────────────────┘

Level 1: Lobby (Global Scope)
┌──────────────────────────────────────┐
│  Topic: "waiting_room:lobby"         │
│                                      │
│  Purpose:                            │
│  • Browse available rooms            │
│  • Receive room list updates         │
│  • Get notifications                 │
│                                      │
│  Events:                             │
│  • overview_of_rooms                 │
│  • room_created                      │
│  • room_deleted                      │
└──────────────────────────────────────┘

Level 2: Room (Room-Specific Scope)
┌──────────────────────────────────────┐
│  Topic: "waiting_room:{room_id}"     │
│                                      │
│  Purpose:                            │
│  • Player interactions               │
│  • Chat messages                     │
│  • Game start coordination           │
│  • Room state updates                │
│                                      │
│  Events:                             │
│  • overview_room                     │
│  • player_joined                     │
│  • player_left                       │
│  • chat_message                      │
│  • start_game                        │
└──────────────────────────────────────┘

Level 3: Game (In-Game Scope)
┌──────────────────────────────────────┐
│  Topic: "game:{game_id}"             │
│                                      │
│  Purpose:                            │
│  • Code synchronization              │
│  • Submission broadcasting           │
│  • Game state updates                │
│  • Winner announcements              │
│                                      │
│  Events:                             │
│  • code_update                       │
│  • submit_code                       │
│  • player_online                     │
│  • player_completed                  │
│  • game_completed                    │
└──────────────────────────────────────┘
```

### Multiplayer Flow Sequence

```
Host                 Backend              Player              Database
 │                      │                    │                    │
 │  1. Join Lobby       │                    │                    │
 ├─────────────────────>│                    │                    │
 │  overview_of_rooms   │                    │                    │
 │<─────────────────────┤                    │                    │
 │                      │                    │                    │
 │  2. Host Room        │                    │                    │
 ├─────────────────────>│  Create Game       │                    │
 │                      ├───────────────────────────────────────>│
 │                      │  Insert game record│                    │
 │  room_created        │<───────────────────────────────────────┤
 │<─────────────────────┤                    │                    │
 │                      │  Broadcast to lobby│                    │
 │                      ├═══════════════════>│  overview_of_rooms │
 │                      │                    │                    │
 │  3. Join Room        │                    │  4. Join Room      │
 │  "waiting_room:123"  │                    │  "waiting_room:123"│
 ├─────────────────────>│                    ├───────────────────>│
 │                      │  Add player        │                    │
 │                      ├───────────────────────────────────────>│
 │  overview_room       │<───────────────────────────────────────┤
 │<─────────────────────┤  Broadcast to room │  overview_room     │
 │                      ├═══════════════════>│                    │
 │                      │                    │                    │
 │  5. Chat             │                    │                    │
 ├─────────────────────>│  Broadcast to room │  chat_message      │
 │                      ├═══════════════════>│                    │
 │  chat_message        │                    │                    │
 │<═════════════════════┤                    │                    │
 │                      │                    │                    │
 │  6. Start Game       │                    │                    │
 ├─────────────────────>│  Update game status│                    │
 │                      ├───────────────────────────────────────>│
 │  start_game          │<───────────────────────────────────────┤
 │<═════════════════════╪═══════════════════>│  start_game        │
 │                      │                    │                    │
 │  7. Navigate to game │                    │                    │
 │  /multiplayer/123    │                    │  /multiplayer/123  │
 │                      │                    │                    │
```

### Frontend WebSocket Management

```typescript
// Dual WebSocket Manager Pattern
class MultiplayerPage {
	// Always connected - for lobby updates
	lobbyWsManager: PhoenixSocketManager;

	// Connected only when in a room
	roomWsManager: PhoenixSocketManager | null = null;

	async hostRoom() {
		// 1. Create room via REST API
		const game = await createGame({
			mode: "FASTEST",
			visibility: "public",
			puzzle_id: selectedPuzzle.id
		});

		// 2. Connect to room-specific channel
		this.roomWsManager = new PhoenixSocketManager({
			topic: `waiting_room:${game.id}`,
			onMessage: this.handleRoomMessage
		});

		await this.roomWsManager.connect();
	}

	async leaveRoom() {
		// 1. Send leave event
		this.roomWsManager?.send("leave_room", {});

		// 2. Destroy room connection
		this.roomWsManager?.destroy();
		this.roomWsManager = null;

		// 3. Clear local state
		this.currentRoom = null;

		// 4. Clear URL param to prevent auto-rejoin
		goto("/multiplayer");
	}
}
```

---

## Code Execution Pipeline

### Piston Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CODE EXECUTION PIPELINE                                    │
└─────────────────────────────────────────────────────────────┘

Frontend               Backend               Piston API
   │                      │                       │
   │  1. Submit Code      │                       │
   ├─────────────────────>│                       │
   │  POST /api/execute   │                       │
   │  {code, language}    │                       │
   │                      │  2. Validate          │
   │                      │  - Check language     │
   │                      │  - Rate limit         │
   │                      │  - Max code length    │
   │                      │                       │
   │                      │  3. Prepare Request   │
   │                      │  {                    │
   │                      │    language: "python",│
   │                      │    version: "3.10",   │
   │                      │    files: [{...}],    │
   │                      │    stdin: "",         │
   │                      │    timeout: 3000      │
   │                      │  }                    │
   │                      │                       │
   │                      │  4. Execute           │
   │                      ├──────────────────────>│
   │                      │  POST /execute        │
   │                      │                       │
   │                      │                       │  Isolate
   │                      │                       │  Execute
   │                      │                       │  Capture
   │                      │                       │
   │                      │  5. Response          │
   │                      │<──────────────────────┤
   │                      │  {                    │
   │                      │    run: {             │
   │                      │      stdout: "...",   │
   │                      │      stderr: "...",   │
   │                      │      code: 0,         │
   │                      │      signal: null     │
   │                      │    }                  │
   │                      │  }                    │
   │                      │                       │
   │                      │  6. Validate Output   │
   │                      │  - Compare with tests │
   │                      │  - Check pass/fail    │
   │                      │                       │
   │                      │  7. Save Submission   │
   │                      │  INSERT INTO          │
   │                      │  submissions          │
   │                      │                       │
   │  8. Response         │                       │
   │<─────────────────────┤                       │
   │  {                   │                       │
   │    passed: true,     │                       │
   │    output: "...",    │                       │
   │    tests: [...]      │                       │
   │  }                   │                       │
```

### Security & Sandboxing

```
┌────────────────────────────────────────────────────────────┐
│  PISTON SECURITY MODEL                                     │
└────────────────────────────────────────────────────────────┘

1. Container Isolation
   ├─ Each execution runs in Docker container
   ├─ No network access
   ├─ Limited file system access
   └─ Resource limits (CPU, memory, processes)

2. Time Limits
   ├─ Compile timeout: 10 seconds
   ├─ Run timeout: 3 seconds
   └─ Total timeout: 15 seconds

3. Memory Limits
   ├─ Max memory: 128MB
   ├─ Max processes: 64
   └─ Max open files: 256

4. Code Restrictions
   ├─ Max code length: 50KB
   ├─ No system calls
   ├─ No network I/O
   └─ No file persistence

5. Output Limits
   ├─ Max stdout: 64KB
   ├─ Max stderr: 64KB
   └─ Truncated if exceeded
```

---

## Frontend Architecture

### SvelteKit Features

```
┌────────────────────────────────────────────────────────────┐
│  SVELTEKIT ARCHITECTURE                                    │
└────────────────────────────────────────────────────────────┘

1. File-Based Routing
   routes/
   ├── +page.svelte              → /
   ├── about/+page.svelte        → /about
   └── puzzles/
       ├── +page.svelte          → /puzzles
       └── [id]/+page.svelte     → /puzzles/:id

2. Load Functions
   +page.server.ts - Server-side data loading
   +page.ts - Client-side data loading

   export async function load({ fetch, params }) {
     const puzzle = await fetch(`/api/puzzles/${params.id}`);
     return { puzzle };
   }

3. Form Actions
   +page.server.ts

   export const actions = {
     create: async ({ request }) => {
       const data = await request.formData();
       // Process form submission
     }
   };

4. Layouts
   +layout.svelte - Wraps child routes
   +layout.server.ts - Shared server data

   (authenticated)/+layout.server.ts
     → Checks auth, redirects if not logged in

5. Error Handling
   +error.svelte - Error page
   Handles 404, 500, etc.
```

### Component Patterns

```svelte
<!-- Reactive Declarations -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>

<!-- Svelte 5 Runes -->
<script lang="ts">
  // State
  let name = $state('');

  // Derived
  let greeting = $derived(`Hello, ${name}!`);

  // Props
  let { title, description }: Props = $props();

  // Effects
  $effect(() => {
    document.title = title;
  });
</script>

<!-- Event Handling -->
<button onclick={() => count++}>
  Increment
</button>

<!-- Conditional Rendering -->
{#if count > 10}
  <p>Count is high</p>
{:else}
  <p>Count is low</p>
{/if}

<!-- Iteration -->
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

### State Management Strategy

```typescript
// Centralized Store Pattern
import { writable, derived } from "svelte/store";

// Authentication Store
export const authStore = writable<AuthState>({
	user: null,
	isAuthenticated: false,
	loading: true
});

export const isAuthenticated = derived(
	authStore,
	($auth) => $auth.isAuthenticated
);

// Usage in Components
import { authStore, isAuthenticated } from "@/stores/auth.store";

$: if ($isAuthenticated) {
	// User is logged in
}

// Update store
authStore.update((state) => ({
	...state,
	user: fetchedUser,
	isAuthenticated: true
}));
```

---

## Technology Stack

### Backend Stack (Elixir/Phoenix)

| Component       | Technology       | Version  | Purpose                         |
| --------------- | ---------------- | -------- | ------------------------------- |
| **Runtime**     | Elixir           | 1.15+    | Functional programming language |
| **Framework**   | Phoenix          | 1.8+     | Web framework                   |
| **Database**    | PostgreSQL       | 15+      | Relational database             |
| **ORM**         | Ecto             | 3.11+    | Database wrapper                |
| **Auth**        | Guardian         | 2.3+     | JWT authentication              |
| **Password**    | Bcrypt           | 2.3+     | Password hashing                |
| **HTTP Client** | Req              | 0.5+     | HTTP requests                   |
| **WebSocket**   | Phoenix Channels | Built-in | Real-time communication         |
| **Email**       | Swoosh           | 1.15+    | Email delivery                  |
| **Testing**     | ExUnit           | Built-in | Unit testing                    |

### Frontend Stack (TypeScript/SvelteKit)

| Component      | Technology   | Version | Purpose                   |
| -------------- | ------------ | ------- | ------------------------- |
| **Runtime**    | Node.js      | 24+     | JavaScript runtime        |
| **Framework**  | SvelteKit    | 2.0+    | Web application framework |
| **Language**   | TypeScript   | 5.0+    | Type-safe JavaScript      |
| **Build Tool** | Vite         | 5.0+    | Fast bundler              |
| **Styling**    | Tailwind CSS | 3.4+    | Utility-first CSS         |
| **Editor**     | CodeMirror   | 5.x     | Code editor component     |
| **WebSocket**  | Phoenix.js   | 1.7+    | Phoenix channel client    |
| **Validation** | Zod          | 3.23+   | Schema validation         |
| **Forms**      | Superforms   | 2.0+    | Form handling             |
| **Testing**    | Playwright   | 1.45+   | E2E testing               |

### Infrastructure

| Component           | Technology     | Purpose                  |
| ------------------- | -------------- | ------------------------ |
| **Database**        | PostgreSQL 15+ | Primary data store       |
| **Code Execution**  | Piston         | Sandboxed code execution |
| **Container**       | Docker         | Service isolation        |
| **Orchestration**   | Docker Compose | Local development        |
| **Package Manager** | pnpm           | Workspace management     |
| **Version Control** | Git            | Source control           |

### Database Extensions

```sql
-- PostgreSQL Extensions Used
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "citext";        -- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- GIN indexes
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│  DEVELOPMENT SETUP                                          │
└─────────────────────────────────────────────────────────────┘

Terminal 1:
$ cd libs/backend/codincod_api
$ mix phx.server
→ Backend running on http://localhost:4000

Terminal 2:
$ cd libs/frontend
$ pnpm dev
→ Frontend running on http://localhost:5173

Docker:
$ docker compose up -d
→ PostgreSQL on localhost:5432
→ Piston on localhost:2000
```

### Production Architecture (Proposed)

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION DEPLOYMENT (Proposed)                           │
└─────────────────────────────────────────────────────────────┘

Internet
   │
   ▼
[Load Balancer / CDN]
   │
   ├──────────────────┬──────────────────┐
   │                  │                  │
   ▼                  ▼                  ▼
[Frontend]      [Frontend]       [Frontend]
(SvelteKit)     (SvelteKit)      (SvelteKit)
   │                  │                  │
   └──────────────────┴──────────────────┘
                      │
                      ▼
              [API Gateway]
                      │
   ┌──────────────────┼──────────────────┐
   │                  │                  │
   ▼                  ▼                  ▼
[Backend]        [Backend]         [Backend]
(Phoenix)        (Phoenix)         (Phoenix)
   │                  │                  │
   └──────────────────┴──────────────────┘
                      │
   ┌──────────────────┼──────────────────┐
   │                  │                  │
   ▼                  ▼                  ▼
[PostgreSQL     [Redis Cache]    [Piston]
 Primary]            │            (Workers)
   │                 │                 │
   ▼                 │                 │
[PostgreSQL          │                 │
 Replica]            │                 │
                     │                 │
                     ▼                 ▼
              [Monitoring]      [Job Queue]
              (Telemetry)       (Oban)
```

### Environment Configuration

```elixir
# config/runtime.exs
import Config

if config_env() == :prod do
  database_url = System.get_env("DATABASE_URL") ||
    raise "DATABASE_URL not available"

  config :codincod_api, CodincodApi.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    ssl: true

  config :codincod_api, CodincodApiWeb.Endpoint,
    url: [host: System.get_env("PHX_HOST"), port: 443],
    http: [port: String.to_integer(System.get_env("PORT") || "4000")],
    secret_key_base: System.get_env("SECRET_KEY_BASE")

  config :codincod_api, :piston_url,
    System.get_env("PISTON_URL") || "http://piston:2000"
end
```

---

## Security Model

### Security Layers

```
┌────────────────────────────────────────────────────────────┐
│  SECURITY ARCHITECTURE                                     │
└────────────────────────────────────────────────────────────┘

1. Network Layer
   ├─ HTTPS/TLS encryption
   ├─ CORS restrictions
   ├─ Rate limiting
   └─ DDoS protection

2. Authentication Layer
   ├─ JWT tokens (HS256)
   ├─ HTTP-only cookies
   ├─ Token expiration (24h)
   └─ Refresh token rotation

3. Authorization Layer
   ├─ Role-based access control
   ├─ Resource ownership checks
   ├─ Permission middleware
   └─ Audit logging

4. Application Layer
   ├─ Input validation (Ecto changesets)
   ├─ SQL injection prevention (parameterized queries)
   ├─ XSS prevention (HTML escaping)
   └─ CSRF protection

5. Data Layer
   ├─ Password hashing (Bcrypt)
   ├─ Encrypted backups
   ├─ PII anonymization
   └─ Data retention policies

6. Code Execution Layer
   ├─ Sandboxed containers
   ├─ Resource limits
   ├─ No network access
   └─ Timeout enforcement
```

### Common Vulnerabilities & Mitigations

| Vulnerability             | Mitigation                                   |
| ------------------------- | -------------------------------------------- |
| **SQL Injection**         | Ecto parameterized queries, input validation |
| **XSS**                   | HTML escaping, CSP headers, sanitization     |
| **CSRF**                  | SameSite cookies, CSRF tokens                |
| **Authentication Bypass** | JWT verification, secure token storage       |
| **Session Hijacking**     | HTTP-only cookies, secure flag, expiration   |
| **Code Injection**        | Sandboxed execution, input validation        |
| **DoS**                   | Rate limiting, timeout enforcement           |
| **Privilege Escalation**  | Role checks, resource ownership validation   |
| **Data Leakage**          | Select specific fields, authorization checks |

---

## Performance Considerations

### Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX idx_puzzles_visibility ON puzzles(visibility);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_submissions_user_puzzle ON submissions(user_id, puzzle_id);

-- Partial indexes for active data
CREATE INDEX idx_active_games ON games(status)
  WHERE status = 'in_progress';

-- GIN indexes for arrays and JSONB
CREATE INDEX idx_puzzles_tags ON puzzles USING GIN(tags);
CREATE INDEX idx_users_profile ON users USING GIN(profile);

-- Composite indexes for multi-column queries
CREATE INDEX idx_game_players_lookup ON game_players(game_id, user_id);
```

### Query Optimization Patterns

```elixir
# Bad: N+1 query problem
games = Games.list_games()
Enum.map(games, fn game ->
  owner = Accounts.get_user!(game.owner_id)  # N queries
  puzzle = Puzzles.get_puzzle!(game.puzzle_id)  # N queries
  {game, owner, puzzle}
end)

# Good: Preload associations
games = Games.list_games(preload: [:owner, :puzzle])  # 1 query
Enum.map(games, fn game ->
  {game, game.owner, game.puzzle}
end)

# Better: Select only needed fields
from(g in Game,
  join: u in assoc(g, :owner),
  join: p in assoc(g, :puzzle),
  where: g.status == "waiting",
  select: %{
    game_id: g.id,
    owner_name: u.username,
    puzzle_title: p.title
  }
)
```

### Caching Strategy

```elixir
# Cacheable data:
# - Programming languages list (rarely changes)
# - Puzzle details (changes infrequently)
# - Leaderboard rankings (5-minute cache)
# - User profiles (1-minute cache)

defmodule CodincodApi.Cache do
  use Nebulex.Cache,
    otp_app: :codincod_api,
    adapter: Nebulex.Adapters.Local

  # Cache puzzle for 1 hour
  def get_puzzle(id) do
    get_or_store({:puzzle, id}, fn ->
      Puzzles.get_puzzle!(id)
    end, ttl: :timer.hours(1))
  end

  # Cache leaderboard for 5 minutes
  def get_leaderboard do
    get_or_store(:leaderboard, fn ->
      Leaderboards.global()
    end, ttl: :timer.minutes(5))
  end
end
```

### WebSocket Scaling

```elixir
# Phoenix PubSub for distributed channels
config :codincod_api, CodincodApiWeb.Endpoint,
  pubsub_server: CodincodApi.PubSub

# Redis adapter for multi-node pubsub
config :codincod_api, CodincodApi.PubSub,
  adapter: Phoenix.PubSub.Redis,
  url: System.get_env("REDIS_URL")

# Presence tracking across nodes
alias Phoenix.Presence

# Track user presence
Presence.track(socket, user_id, %{
  online_at: System.system_time(:second),
  username: username
})

# List all present users
Presence.list(socket)
```

---

## Schema Legend

### Symbol Key

```
Relationship Symbols:
├─  Tree branch (component hierarchy)
│   Vertical line (continuation)
└─  Last branch
┌─  Top-left corner
┐   Top-right corner
└─  Bottom-left corner
┘   Bottom-right corner
─   Horizontal line
→   One-directional flow
↔   Bidirectional communication
═   WebSocket connection
▼   Data flow downward
▲   Data flow upward
*   Many (in relationships)
1   One (in relationships)

Database Symbols:
◄─  References (foreign key)
►   Referenced by
```

### Diagram Conventions

- **Boxes** represent system components
- **Arrows** show data/control flow
- **Double lines** (═) indicate persistent connections
- **Dashed lines** indicate optional/conditional paths
- **Numbers** indicate sequence of operations

---

**End of Architecture Documentation**

_This document provides a comprehensive overview of the CodinCod platform architecture. For specific implementation details, refer to individual module documentation and source code._
