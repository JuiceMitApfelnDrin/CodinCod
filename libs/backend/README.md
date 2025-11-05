# CodinCod Elixir API Backend

Modern Elixir/Phoenix backend for the CodinCod coding puzzle platform. This is a complete rewrite of the Node.js/Fastify backend with improved performance, scalability, and real-time capabilities.

## Features

- 🔐 **JWT Authentication** with Guardian
- 🎮 **Real-Time Multiplayer** with Phoenix Channels
- 🧩 **Puzzle Management** with advanced search and filtering
- 💻 **Code Execution** via Piston API integration
- 📊 **Leaderboards & Statistics** with ELO-style rankings
- 💬 **Real-Time Chat** in multiplayer games
- 🛡️ **Moderation Tools** for content review
- 📈 **Background Jobs** with Oban
- ⚡ **Rate Limiting** with Hammer
- 🗄️ **PostgreSQL** database with UUIDs

## Tech Stack

- **Elixir** 1.15+
- **Phoenix** 1.8+ (API-only)
- **PostgreSQL** 16+
- **Ecto** 3.13+ (ORM)
- **Guardian** 2.3+ (JWT)
- **Oban** 2.18+ (Background jobs)
- **Phoenix Channels** (WebSockets)

## Prerequisites

- Elixir 1.15 or higher
- Erlang/OTP 26 or higher
- PostgreSQL 16 or higher
- Docker & Docker Compose (optional)

## Installation

### 1. Install Dependencies

```bash
cd libs/elixir-backend/codincod_api
mix deps.get
```
### 2. Start Infrastructure (Docker)

```bash
cd libs/elixir-backend
docker compose up -d postgres piston redis
```

> The compose file also provides an `api` service. Run `docker compose up --build api`
> if you prefer the Phoenix server to run inside Docker instead of your local Elixir toolchain.

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Create and Migrate Database

```bash
mix ecto.create
mix ecto.migrate
```

### 5. Seed Database (Optional)

```bash
mix run priv/repo/seeds.exs
```

### 6. Start Phoenix Server

```bash
mix phx.server
```

Or inside IEx:

```bash
iex -S mix phx.server
```

The API will be available at http://localhost:4000

## Development

### Running Tests

```bash
# Run all tests
mix test

# Run with coverage
mix test --cover

# Watch mode
mix test.watch
```

### Code Quality

```bash
# Linting with Credo
mix credo

# Static analysis with Dialyzer
mix dialyzer

# Format code
mix format
```

### Database

```bash
# Create migration
mix ecto.gen.migration migration_name

# Run migrations
mix ecto.migrate

# Rollback
mix ecto.rollback

# Reset database
mix ecto.reset
```

### Generating Code

```bash
# Generate context with schema
mix phx.gen.context Accounts User users email:string username:string

# Generate schema only
mix phx.gen.schema Accounts.User users email:string

# Generate JSON API
mix phx.gen.json Accounts User users email:string
```

## Project Structure

```
codincod_api/
├── config/              # Application configuration
│   ├── config.exs       # Base configuration
│   ├── dev.exs          # Development config
│   ├── test.exs         # Test config
│   ├── prod.exs         # Production config
│   └── runtime.exs      # Runtime config (env vars)
├── lib/
│   ├── codincod_api/    # Core application
│   │   ├── accounts/    # User authentication & management
│   │   ├── puzzles/     # Puzzle system
│   │   ├── submissions/ # Code submissions
│   │   ├── games/       # Multiplayer games
│   │   ├── chat/        # Real-time chat
│   │   ├── comments/    # Comments & voting
│   │   ├── moderation/  # Content moderation
│   │   ├── metrics/     # Statistics & leaderboards
│   │   ├── languages/   # Programming languages
│   │   └── repo.ex      # Database repository
│   └── codincod_api_web/ # Web interface
│       ├── channels/    # WebSocket channels
│       ├── controllers/ # HTTP controllers
│       ├── auth/        # Authentication (Guardian)
│       ├── plugs/       # Custom plugs
│       ├── views/       # JSON views
│       └── router.ex    # Route definitions
├── priv/
│   ├── repo/
│   │   ├── migrations/  # Database migrations
│   │   └── seeds.exs    # Seed data
│   └── static/          # Static files
├── test/                # Tests
│   ├── codincod_api/    # Context tests
│   ├── codincod_api_web/ # Controller tests
│   └── support/         # Test helpers & factories
└── mix.exs              # Dependencies & config
```

## API Documentation

### Authentication Endpoints

```
POST   /api/register           - Register new user
POST   /api/login              - Login user
POST   /api/logout             - Logout user
POST   /api/refresh            - Refresh JWT token
GET    /api/user               - Get current user
```

### User Endpoints

```
GET    /api/users/:id          - Get user profile
PUT    /api/users/:id          - Update user
GET    /api/users/:username/activity
GET    /api/users/:username/puzzles
```

### Puzzle Endpoints

```
GET    /api/puzzle             - List puzzles
POST   /api/puzzle             - Create puzzle
GET    /api/puzzle/:id         - Get puzzle
PUT    /api/puzzle/:id         - Update puzzle
DELETE /api/puzzle/:id         - Delete puzzle
GET    /api/puzzle/:id/comments
POST   /api/puzzle/:id/comments
```

### Submission Endpoints

```
GET    /api/submission         - List user submissions
POST   /api/submission         - Submit code
GET    /api/submission/:id     - Get submission
```

### Game Endpoints

```
WebSocket: /socket/waiting_room - Waiting room lobby
WebSocket: /socket/game/:id     - Game room
```

## WebSocket Events

### Waiting Room Channel

```elixir
# Join waiting room
Phoenix.Channel.join("waiting_room:lobby")

# Host a room
push("room:host", %{options: %{visibility: "public"}})

# Join a room
push("room:join", %{room_id: "abc123"})

# Events received
handle_in("rooms:overview", payload)
handle_in("game:start", %{game_url: url})
```

### Game Channel

```elixir
# Join game
Phoenix.Channel.join("game:#{game_id}")

# Submit code
push("game:submit", %{code: code, language: "python"})

# Send chat message
push("chat:message", %{message: "Hello!"})

# Events received
handle_in("game:update", game_state)
handle_in("player:submitted", %{user: user})
handle_in("chat:message", message)
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:

```bash
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY_BASE=generate_with_mix_phx_gen_secret
JWT_SECRET=your_jwt_secret
PISTON_URI=http://localhost:2000
FRONTEND_URL=http://localhost:5173
```

## Background Jobs

The application uses Oban for background job processing:

```elixir
# Queue a code execution job
%{submission_id: submission.id}
|> CodincodApi.Workers.ExecuteSubmission.new()
|> Oban.insert()

# Queue a statistics update
%{user_id: user.id}
|> CodincodApi.Workers.UpdateStatistics.new()
|> Oban.insert()
```

## Deployment

### Using Docker

```bash
# Build image
docker build -t codincod-api .

# Run container
docker run -p 4000:4000 \
  -e DATABASE_URL=... \
  -e SECRET_KEY_BASE=... \
  codincod-api
```

### Using Mix Release

```bash
# Build release
MIX_ENV=prod mix release

# Run release
_build/prod/rel/codincod_api/bin/codincod_api start
```

## Monitoring

Access Phoenix LiveDashboard at: http://localhost:4000/dev/dashboard

Metrics include:
- Request rates and latencies
- Database query performance
- Background job statistics
- WebSocket connection counts
- System resource usage

## Migration from MongoDB

To migrate data from the existing MongoDB database:

```bash
# Run full migration
mix migrate_mongo

# Migrate specific entities
mix migrate_mongo --only users
mix migrate_mongo --only puzzles

# Validate migration
mix migrate_mongo --validate
```

## TypeScript Type Generation

The Elixir backend publishes an OpenAPI document that feeds the shared `libs/types` package.

```bash
# From libs/elixir-backend/codincod_api
mix codincod.gen_openapi_spec

# From repo root (requires pnpm)
pnpm --filter types run openapi:types
```

The second command regenerates `libs/types/src/generated/elixir-openapi.ts`, keeping the frontend
contracts in sync with the Phoenix controllers. Run these steps after adding or changing endpoints
or schemas.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

docker-compose restart postgres
# Restart PostgreSQL
docker compose restart postgres

docker-compose logs postgres
# Check logs
docker compose logs postgres
```

### Compilation Errors

```bash
# Clean and recompile
mix clean
mix compile
```

### Port Already in Use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

- [Phoenix Framework](https://phoenixframework.org/)
- [Ecto Documentation](https://hexdocs.pm/ecto/)
- [Guardian Documentation](https://hexdocs.pm/guardian/)
- [Oban Documentation](https://hexdocs.pm/oban/)
- [Phoenix Channels Guide](https://hexdocs.pm/phoenix/channels.html)

## License

Copyright © 2024 CodinCod

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [Migration Guide](./MIGRATION_GUIDE.md)
- Consult the Phoenix documentation
