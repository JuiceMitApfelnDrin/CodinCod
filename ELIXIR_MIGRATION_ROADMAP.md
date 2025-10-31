# Elixir Migration Roadmap

## Overview

This document outlines a comprehensive, step-by-step plan for migrating the CodinCod backend from Node.js/Fastify to Elixir/Phoenix while maintaining the Svelte/SvelteKit frontend with minimal disruption.

### Migration Philosophy

- **Incremental**: Migrate feature by feature, not all at once
- **Parallel Running**: Run both backends simultaneously during transition
- **Frontend Unchanged**: Keep Svelte frontend intact throughout
- **Data Migration**: Careful planning for PostgreSQL migration
- **Risk Mitigation**: Each phase can be rolled back independently

### Technology Stack (Target)

**Backend**:
- Elixir 1.16+
- Phoenix 1.7+ (REST APIs)
- Phoenix LiveView (WebSockets/real-time)
- Ecto (ORM)
- PostgreSQL 16+
- Oban (background jobs)

**Frontend** (Unchanged):
- Svelte 5
- SvelteKit
- TypeScript
- Tailwind CSS

---

## Phase 0: Preparation & Infrastructure (3-4 weeks)

### Week 1-2: Learning & Setup

**Objectives**:
- Team familiarization with Elixir/Phoenix
- Development environment setup
- Initial architecture decisions

**Tasks**:
1. **Learn Elixir Fundamentals**
   - Pattern matching, immutability, functional programming
   - OTP (GenServers, Supervisors, Applications)
   - Phoenix framework basics
   - Ecto query language

2. **Set Up Development Environment**
   ```bash
   # Install Elixir and Phoenix
   brew install elixir
   mix archive.install hex phx_new
   
   # Create new Phoenix project
   mix phx.new codincod_api --no-html --no-assets
   cd codincod_api
   mix deps.get
   ```

3. **Architecture Documentation**
   - Document current Node.js architecture
   - Design Elixir equivalent architecture
   - Plan service boundaries and contexts

### Week 3-4: PostgreSQL Migration Planning

**Objectives**:
- Design PostgreSQL schema
- Create migration strategy
- Set up database infrastructure

**Tasks**:
1. **Schema Design**
   - Convert MongoDB schemas to PostgreSQL tables
   - Design proper foreign keys and constraints
   - Plan indexes for performance
   - Handle ObjectId → UUID/BigInt conversion

2. **Migration Script Development**
   - Write data migration scripts
   - Create rollback procedures
   - Test data integrity validation

3. **Database Setup**
   ```bash
   # PostgreSQL setup
   docker-compose.yml:
     postgres:
       image: postgres:16
       environment:
         POSTGRES_DB: codincod_dev
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
   ```

4. **Ecto Schema Creation**
   ```elixir
   # Example: lib/codincod_api/accounts/user.ex
   defmodule CodincodApi.Accounts.User do
     use Ecto.Schema
     import Ecto.Changeset

     @primary_key {:id, :binary_id, autogenerate: true}
     schema "users" do
       field :username, :string
       field :email, :string
       field :password_hash, :string
       field :role, :string, default: "user"
       field :rating, :integer, default: 1500

       has_many :puzzles, CodincodApi.Puzzles.Puzzle
       has_many :submissions, CodincodApi.Submissions.Submission

       timestamps()
     end
   end
   ```

**Deliverables**:
- Elixir development environment
- PostgreSQL database with schema
- Data migration scripts (untested)
- Architecture documentation

---

## Phase 1: Authentication Service (4-6 weeks)

### Why Start with Authentication?

- Foundational for all other features
- Clear boundaries, well-defined API
- Relatively isolated from other services
- Good learning opportunity

### Week 1-2: Core Authentication

**Objectives**:
- Implement user registration and login
- JWT token generation and validation
- Password hashing with Argon2

**Tasks**:
1. **Create Accounts Context**
   ```elixir
   # lib/codincod_api/accounts.ex
   defmodule CodincodApi.Accounts do
     import Ecto.Query
     alias CodincodApi.Repo
     alias CodincodApi.Accounts.User

     def create_user(attrs) do
       %User{}
       |> User.changeset(attrs)
       |> Repo.insert()
     end

     def get_user_by_email(email) do
       Repo.get_by(User, email: email)
     end

     def verify_password(user, password) do
       Argon2.verify_pass(password, user.password_hash)
     end
   end
   ```

2. **Implement Auth Controllers**
   ```elixir
   # lib/codincod_api_web/controllers/auth_controller.ex
   defmodule CodincodApiWeb.AuthController do
     use CodincodApiWeb, :controller

     alias CodincodApi.Accounts
     alias CodincodApiWeb.Auth.Guardian

     def register(conn, %{"username" => username, "email" => email, "password" => password}) do
       with {:ok, user} <- Accounts.create_user(%{username: username, email: email, password: password}),
            {:ok, token, _claims} <- Guardian.encode_and_sign(user) do
         conn
         |> put_status(:created)
         |> json(%{token: token, user: user_response(user)})
       end
     end

     def login(conn, %{"identifier" => identifier, "password" => password}) do
       # Implementation
     end
   end
   ```

3. **JWT Integration with Guardian**
   ```elixir
   # lib/codincod_api_web/auth/guardian.ex
   defmodule CodincodApiWeb.Auth.Guardian do
     use Guardian, otp_app: :codincod_api

     def subject_for_token(%{id: id}, _claims) do
       {:ok, to_string(id)}
     end

     def resource_from_claims(%{"sub" => id}) do
       case CodincodApi.Accounts.get_user(id) do
         nil -> {:error, :user_not_found}
         user -> {:ok, user}
       end
     end
   end
   ```

4. **Authentication Plug**
   ```elixir
   # lib/codincod_api_web/plugs/auth.ex
   defmodule CodincodApiWeb.Plugs.Auth do
     import Plug.Conn
     alias CodincodApiWeb.Auth.Guardian

     def init(opts), do: opts

     def call(conn, _opts) do
       with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
            {:ok, claims} <- Guardian.decode_and_verify(token),
            {:ok, user} <- Guardian.resource_from_claims(claims) do
         assign(conn, :current_user, user)
       else
         _ -> 
           conn
           |> put_status(:unauthorized)
           |> Phoenix.Controller.json(%{error: "Unauthorized"})
           |> halt()
       end
     end
   end
   ```

### Week 3-4: Session Management & Middleware

**Tasks**:
1. **Session Store (if needed)**
   - Redis integration for session storage
   - Token revocation mechanism

2. **Rate Limiting**
   ```elixir
   # Using Hammer library
   defmodule CodincodApiWeb.Plugs.RateLimit do
     import Plug.Conn
     alias Hammer

     def init(opts), do: opts

     def call(conn, opts) do
       case Hammer.check_rate("#{conn.remote_ip}:login", 60_000, 5) do
         {:allow, _count} -> conn
         {:deny, _limit} ->
           conn
           |> put_status(:too_many_requests)
           |> Phoenix.Controller.json(%{error: "Too many requests"})
           |> halt()
       end
     end
   end
   ```

3. **User Profile Endpoints**
   - GET /api/v1/user/me
   - PUT /api/v1/account
   - GET /api/v1/user/:username

### Week 5-6: Frontend Integration & Testing

**Tasks**:
1. **Update SvelteKit Frontend**
   ```typescript
   // libs/types/src/core/common/config/backend-urls.ts
   const ELIXIR_BACKEND = import.meta.env.VITE_ELIXIR_BACKEND_URL || 'http://localhost:4000';
   
   export const backendUrls = {
     // Migrate auth endpoints to Elixir
     REGISTER: USE_ELIXIR_AUTH ? `${ELIXIR_BACKEND}/api/v1/register` : `${baseRoute}/register`,
     LOGIN: USE_ELIXIR_AUTH ? `${ELIXIR_BACKEND}/api/v1/login` : `${baseRoute}/login`,
     // ...
   };
   ```

2. **Feature Flag System**
   ```typescript
   // Environment-based feature flags
   export const featureFlags = {
     useElixirAuth: import.meta.env.VITE_USE_ELIXIR_AUTH === 'true',
     useElixirPuzzles: import.meta.env.VITE_USE_ELIXIR_PUZZLES === 'true',
     // etc.
   };
   ```

3. **Testing**
   - Unit tests with ExUnit
   - Integration tests for auth flow
   - E2E tests with existing Playwright suite

**Deliverables**:
- Complete authentication service in Elixir
- Frontend can use either Node.js or Elixir auth
- Feature flags for gradual rollout
- Comprehensive test coverage

---

## Phase 2: Puzzle Service (4-5 weeks)

### Week 1-2: Core Puzzle Operations

**Objectives**:
- CRUD operations for puzzles
- Solutions and validators
- Author attribution

**Tasks**:
1. **Puzzles Context**
   ```elixir
   defmodule CodincodApi.Puzzles do
     alias CodincodApi.Puzzles.Puzzle
     alias CodincodApi.Repo

     def list_puzzles(params) do
       Puzzle
       |> filter_by_difficulty(params[:difficulty])
       |> filter_by_author(params[:author])
       |> paginate(params)
       |> Repo.all()
       |> Repo.preload([:author, :solutions])
     end

     def create_puzzle(user, attrs) do
       %Puzzle{author_id: user.id}
       |> Puzzle.changeset(attrs)
       |> Repo.insert()
     end
   end
   ```

2. **API Endpoints**
   - GET /api/v1/puzzle
   - POST /api/v1/puzzle
   - GET /api/v1/puzzle/:id
   - PUT /api/v1/puzzle/:id
   - DELETE /api/v1/puzzle/:id

3. **Solutions & Validators**
   ```elixir
   defmodule CodincodApi.Puzzles.Solution do
     use Ecto.Schema

     schema "solutions" do
       field :code, :string
       field :test_cases, :map  # JSONB

       belongs_to :puzzle, CodincodApi.Puzzles.Puzzle
       belongs_to :language, CodincodApi.Languages.ProgrammingLanguage

       timestamps()
     end
   end
   ```

### Week 3-4: Comments & Voting

**Tasks**:
1. **Comments System**
   - Nested comments support
   - Comment CRUD
   - Pagination

2. **Voting System**
   - Upvote/downvote
   - Vote counts
   - User vote tracking

3. **Integration with Piston API**
   - HTTP client with Tesla/Finch
   - Code execution proxying
   - Result parsing

### Week 5: Testing & Migration

**Tasks**:
- Migrate puzzle data from MongoDB to PostgreSQL
- Frontend integration
- Parallel testing (both backends)

**Deliverables**:
- Complete puzzle service
- Comments and voting
- Data migration complete

---

## Phase 3: Submission Service (3-4 weeks)

### Week 1-2: Core Submissions

**Objectives**:
- Code submission handling
- Execution result storage
- User submission history

**Tasks**:
1. **Submissions Context**
   ```elixir
   defmodule CodincodApi.Submissions do
     def create_submission(user, attrs) do
       %Submission{user_id: user.id}
       |> Submission.changeset(attrs)
       |> Repo.insert()
     end

     def execute_and_store(submission) do
       with {:ok, result} <- PistonClient.execute(submission.code, submission.language),
            {:ok, submission} <- update_submission_result(submission, result) do
         {:ok, submission}
       end
     end
   end
   ```

2. **Background Jobs with Oban**
   ```elixir
   defmodule CodincodApi.Workers.ExecuteSubmission do
     use Oban.Worker

     @impl Oban.Worker
     def perform(%Oban.Job{args: %{"submission_id" => id}}) do
       submission = Submissions.get_submission!(id)
       Submissions.execute_and_store(submission)
     end
   end
   ```

### Week 3-4: Leaderboards & Stats

**Tasks**:
- User statistics
- Puzzle solve rates
- Language popularity metrics
- Leaderboard queries (optimized with indexes)

**Deliverables**:
- Submission service complete
- Background job processing
- Statistics and leaderboards

---

## Phase 4: Real-Time Game System (6-8 weeks)

### Week 1-3: Phoenix Channels for WebSockets

**Objectives**:
- Migrate waiting room WebSocket logic
- Game session management
- Real-time player synchronization

**Tasks**:
1. **Waiting Room Channel**
   ```elixir
   defmodule CodincodApiWeb.WaitingRoomChannel do
     use CodincodApiWeb, :channel

     def join("waiting_room:lobby", _payload, socket) do
       {:ok, socket}
     end

     def handle_in("room:host", %{"options" => options}, socket) do
       # Create room logic
       broadcast(socket, "rooms:overview", %{rooms: list_rooms()})
       {:reply, {:ok, %{room_id: room_id}}, socket}
     end

     def handle_in("room:join", %{"room_id" => room_id}, socket) do
       # Join room logic
     end
   end
   ```

2. **Game Channel**
   ```elixir
   defmodule CodincodApiWeb.GameChannel do
     use CodincodApiWeb, :channel

     def join("game:" <> game_id, _payload, socket) do
       game = Games.get_game!(game_id)
       {:ok, assign(socket, :game, game)}
     end

     def handle_in("game:submit", %{"code" => code}, socket) do
       # Submission logic
       broadcast(socket, "player:submitted", %{user: socket.assigns.current_user})
       {:noreply, socket}
     end
   end
   ```

3. **Presence Tracking**
   ```elixir
   defmodule CodincodApiWeb.Presence do
     use Phoenix.Presence,
       otp_app: :codincod_api,
       pubsub_server: CodincodApi.PubSub
   end
   ```

### Week 4-5: Game Logic & State Management

**Tasks**:
- GenServer for game state
- Countdown timers
- Player submission tracking
- Score calculation

**Example GenServer**:
```elixir
defmodule CodincodApi.GameServer do
  use GenServer

  def start_link(game_id) do
    GenServer.start_link(__MODULE__, game_id, name: via_tuple(game_id))
  end

  def init(game_id) do
    game = Games.get_game!(game_id)
    schedule_game_end(game.end_time)
    {:ok, %{game: game, players: %{}}}
  end

  def handle_info(:end_game, state) do
    # Calculate final scores, notify players
    Games.finalize_game(state.game.id)
    {:stop, :normal, state}
  end

  defp via_tuple(game_id) do
    {:via, Registry, {CodincodApi.GameRegistry, game_id}}
  end
end
```

### Week 6-8: Chat & Testing

**Tasks**:
- Chat message handling
- Message persistence
- Frontend WebSocket integration
- Load testing with many concurrent games

**Deliverables**:
- Complete real-time game system
- WebSocket channels working
- Chat functionality
- Performance tested

---

## Phase 5: Moderation & Admin (2-3 weeks)

### Week 1-2: Moderation Tools

**Tasks**:
1. **Review System**
   - Puzzle approval workflow
   - Report handling
   - Moderation queue

2. **Ban System**
   - Temporary/permanent bans
   - Ban history
   - Middleware for ban checking

3. **Admin Dashboard API**
   - User management
   - System stats
   - Activity logs

**Deliverables**:
- Moderation service complete
- Admin APIs functional

---

## Phase 6: Cleanup & Optimization (3-4 weeks)

### Week 1: Remove Node.js Backend

**Tasks**:
- Verify all features migrated
- Update CI/CD pipelines
- Remove Node.js backend code
- Update deployment configurations

### Week 2-3: Optimization

**Tasks**:
1. **Database Optimization**
   - Add missing indexes
   - Optimize slow queries
   - Set up connection pooling

2. **Caching Strategy**
   - Redis for frequently accessed data
   - ETS for application-level cache
   - CDN for static assets

3. **Performance Tuning**
   ```elixir
   # config/prod.exs
   config :codincod_api, CodincodApiWeb.Endpoint,
     http: [
       port: 4000,
       protocol_options: [max_connections: 16_384]
     ]
   ```

### Week 4: Documentation & Training

**Tasks**:
- Update all documentation
- Team training on Elixir/Phoenix
- Runbook for operations
- Incident response procedures

**Deliverables**:
- Node.js backend retired
- Optimized Elixir backend
- Complete documentation

---

## Data Migration Strategy

### MongoDB → PostgreSQL

**Approach**: Dual-write during transition

1. **Phase 1**: Read from MongoDB, write to both
2. **Phase 2**: Migrate historical data
3. **Phase 3**: Read from PostgreSQL, write to both
4. **Phase 4**: PostgreSQL only

**Example Migration Script**:
```elixir
defmodule CodincodApi.Release.MigrateUsers do
  def run do
    # Read from MongoDB
    {:ok, mongo} = Mongo.start_link(url: "mongodb://localhost:27017/codincod")
    users = Mongo.find(mongo, "users", %{}) |> Enum.to_list()

    # Write to PostgreSQL
    Enum.each(users, fn user ->
      CodincodApi.Accounts.create_user(%{
        id: user["_id"],
        username: user["username"],
        email: user["email"],
        password_hash: user["password"],
        # ...
      })
    end)
  end
end
```

---

## Deployment Strategy

### Parallel Deployment

```
┌─────────────┐
│   Frontend  │ (Svelte/SvelteKit)
│   (Caddy)   │
└─────┬───────┘
      │
      ├──────────┐
      │          │
┌─────▼───┐  ┌──▼────────┐
│ Node.js │  │  Elixir   │
│ Fastify │  │  Phoenix  │
│ MongoDB │  │PostgreSQL │
└─────────┘  └───────────┘
```

**Traffic Routing**:
```
# Caddyfile
codincod.com {
    # Route based on feature flags or user segments
    @auth_elixir header X-Use-Elixir-Auth true
    handle @auth_elixir {
        reverse_proxy elixir_backend:4000
    }

    # Default to Node.js
    reverse_proxy nodejs_backend:3000
}
```

---

## Testing Strategy

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Load Tests**: 1000+ concurrent users

### Testing Tools

```elixir
# test/codincod_api/accounts_test.exs
defmodule CodincodApi.AccountsTest do
  use CodincodApi.DataCase

  alias CodincodApi.Accounts

  describe "users" do
    test "create_user/1 with valid data creates a user" do
      attrs = %{username: "test", email: "test@example.com", password: "password123"}
      assert {:ok, user} = Accounts.create_user(attrs)
      assert user.username == "test"
    end

    test "create_user/1 with duplicate username returns error" do
      attrs = %{username: "test", email: "test@example.com", password: "password123"}
      Accounts.create_user(attrs)
      assert {:error, changeset} = Accounts.create_user(attrs)
      assert "has already been taken" in errors_on(changeset).username
    end
  end
end
```

---

## Rollback Plan

### Per-Phase Rollback

Each phase has independent rollback:

1. **Feature Flag Disable**: Toggle feature flag to route back to Node.js
2. **Database Rollback**: Keep MongoDB read replica during transition
3. **Code Rollback**: Git tags for each phase
4. **Data Integrity**: Regular backups before each migration step

### Emergency Rollback Procedure

```bash
# 1. Disable feature flag
echo "VITE_USE_ELIXIR_AUTH=false" >> .env

# 2. Scale down Elixir backend
kubectl scale deployment elixir-backend --replicas=0

# 3. Scale up Node.js backend
kubectl scale deployment nodejs-backend --replicas=5

# 4. Update load balancer
# Route 100% traffic back to Node.js
```

---

## Success Metrics

### Performance

- [ ] P50 latency < 50ms
- [ ] P95 latency < 200ms
- [ ] P99 latency < 500ms
- [ ] 99.9% uptime

### Migration

- [ ] 100% feature parity
- [ ] Zero data loss
- [ ] No downtime during migration
- [ ] < 5% user-reported issues

### Development

- [ ] CI/CD pipeline < 10 minutes
- [ ] Test suite < 5 minutes
- [ ] Deploy time < 5 minutes

---

## Timeline Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| 0. Preparation | 3-4 weeks | Setup, learning, planning |
| 1. Authentication | 4-6 weeks | User auth, JWT, session |
| 2. Puzzles | 4-5 weeks | CRUD, comments, voting |
| 3. Submissions | 3-4 weeks | Execution, stats |
| 4. Real-Time Games | 6-8 weeks | WebSockets, channels |
| 5. Moderation | 2-3 weeks | Admin, reports, bans |
| 6. Cleanup | 3-4 weeks | Optimization, docs |

**Total**: ~25-34 weeks (6-8 months)

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Medium | Critical | Comprehensive backups, validation scripts, dual-write period |
| Performance regression | Medium | High | Load testing, gradual rollout, monitoring |
| WebSocket incompatibility | Low | High | Thorough testing, protocol versioning |
| Team learning curve | High | Medium | Training, pair programming, code reviews |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Extended downtime | Low | Critical | Parallel deployment, feature flags |
| User dissatisfaction | Medium | High | Gradual rollout, feedback loops |
| Budget overrun | Medium | Medium | Phased approach, regular reviews |

---

## Post-Migration Benefits

### Performance

- **10x faster queries**: PostgreSQL vs MongoDB for relational data
- **Better concurrency**: BEAM VM handles millions of processes
- **Lower latency**: Native WebSocket support

### Development

- **Type safety**: Dialyzer static analysis
- **Hot code reloading**: Zero-downtime deployments
- **Better testing**: ExUnit, property-based testing
- **Cleaner code**: Functional, immutable, pattern matching

### Operations

- **Observability**: Built-in telemetry and metrics
- **Fault tolerance**: OTP supervision trees
- **Scalability**: Distributed Elixir clusters
- **Resource efficiency**: Lower memory footprint

---

## Conclusion

This migration is ambitious but achievable with careful planning and execution. The phased approach allows for continuous delivery of value while reducing risk. The end result will be a more performant, maintainable, and scalable backend that positions CodinCod for future growth.

**Next Steps**:
1. Review and approve this roadmap
2. Allocate team resources
3. Begin Phase 0: Preparation
4. Set up regular migration status meetings
5. Create detailed project plan with milestones

---

## Appendices

### A. Useful Elixir Libraries

- **Phoenix**: Web framework
- **Ecto**: Database wrapper and ORM
- **Guardian**: JWT authentication
- **Oban**: Background job processing
- **Tesla/Finch**: HTTP clients
- **Hammer**: Rate limiting
- **Cachex**: Caching
- **ExUnit**: Testing framework
- **Credo**: Code analysis
- **Dialyzer**: Static type checking

### B. Learning Resources

- [Elixir Official Guides](https://elixir-lang.org/getting-started/introduction.html)
- [Phoenix Framework Guide](https://hexdocs.pm/phoenix/overview.html)
- [Programming Phoenix](https://pragprog.com/titles/phoenix14/programming-phoenix-1-4/)
- [Designing Elixir Systems with OTP](https://pragprog.com/titles/jgotp/designing-elixir-systems-with-otp/)
- [Real-Time Phoenix](https://pragprog.com/titles/sbsockets/real-time-phoenix/)

### C. Team Training Plan

**Week 1-2**: Elixir Fundamentals
- Syntax and basic types
- Pattern matching
- Functions and modules
- Processes and message passing

**Week 3-4**: Phoenix Framework
- Routing and controllers
- Contexts and business logic
- Ecto and database operations
- Testing with ExUnit

**Week 5-6**: Advanced Topics
- OTP and GenServers
- Phoenix Channels
- Deployment and operations
- Performance optimization
