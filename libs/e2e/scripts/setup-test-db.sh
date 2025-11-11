#!/bin/bash

# Database seeding script for E2E tests
# This script resets the test database and runs seeds

set -e  # Exit on error

echo "=== E2E Test Database Setup ==="

# Configuration
BACKEND_DIR="../../backend/codincod_api"
DB_NAME="${POSTGRES_DB:-codincod_api_test}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"

echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "User: $DB_USER"

# Navigate to backend directory
cd "$BACKEND_DIR"

# Drop and recreate database
echo ""
echo "Dropping test database if exists..."
PGPASSWORD=$DB_PASSWORD dropdb -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" --if-exists || true

echo "Creating fresh test database..."
PGPASSWORD=$DB_PASSWORD createdb -h "$DB_HOST" -U "$DB_USER" "$DB_NAME"

# Run migrations
echo ""
echo "Running migrations..."
MIX_ENV=test mix ecto.migrate

# Run seeds
echo ""
echo "Running seeds..."
MIX_ENV=test mix run priv/repo/seeds.exs

echo ""
echo "✓ Test database setup complete!"
echo "Database '$DB_NAME' is ready for E2E tests"
