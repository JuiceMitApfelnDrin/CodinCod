#!/usr/bin/env bash

# CodinCod Elixir Backend Migration Script
# This script continues the migration from TypeScript/MongoDB to Elixir/PostgreSQL

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT/codincod_api"

echo "🚀 Starting CodinCod Elixir Backend Migration..."

# Step 1: Compile dependencies
echo "📦 Compiling dependencies..."
mix deps.compile

# Step 2: Generate authentication system
echo "🔐 Generating authentication system with phx.gen.auth..."
mix phx.gen.auth Accounts User users --binary-id --no-prompt || true

# Step 3: Create database
echo "🗄️  Creating database..."
mix ecto.create

# Step 4: Run migrations
echo "⬆️  Running migrations..."
mix ecto.migrate

echo "✅ Basic migration setup complete!"
echo ""
echo "Next steps:"
echo "1. Review generated authentication code in lib/codincod_api/accounts/"
echo "2. Customize User schema with additional fields (profile, roles, bans)"
echo "3. Create remaining schemas (Puzzle, Submission, Game, etc.)"
echo "4. Implement WebSocket channels for real-time features"
echo "5. Create data migration scripts from MongoDB"
echo "6. Implement TypeScript type generation"
echo ""
echo "📚 Documentation: See MIGRATION_GUIDE.md for detailed steps"
