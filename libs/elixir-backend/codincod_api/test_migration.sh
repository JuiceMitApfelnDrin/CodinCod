#!/bin/bash

# Master test script for MongoDB to PostgreSQL migration
# This script:
# 1. Seeds MongoDB with test data
# 2. Runs the migration
# 3. Verifies the migrated data
#
# Usage:
#   ./test_migration.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   MongoDB → PostgreSQL Migration Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check environment variables
if [ -z "$MONGO_URI" ]; then
    echo -e "${RED}ERROR: MONGO_URI environment variable not set${NC}"
    echo "Please set it to your MongoDB connection string:"
    echo "  export MONGO_URI='mongodb+srv://...'"
    exit 1
fi

if [ -z "$MONGO_DB_NAME" ]; then
    echo -e "${YELLOW}WARNING: MONGO_DB_NAME not set, using default: codincod-development${NC}"
    export MONGO_DB_NAME="codincod-development"
fi

echo -e "${GREEN}✓${NC} Environment variables set"
echo "  MONGO_DB: $MONGO_DB_NAME"
echo ""

# Step 1: Seed test data
echo -e "${BLUE}Step 1/3: Seeding MongoDB with test data...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"
mix run priv/repo/scripts/seed_test_data_mongodb.exs
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to seed test data${NC}"
    exit 1
fi
echo ""

# Step 2: Run migration
echo -e "${BLUE}Step 2/3: Running migration...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"
mix migrate_mongo
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi
echo ""

# Step 3: Verify migration
echo -e "${BLUE}Step 3/3: Verifying migrated data...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"
mix run priv/repo/scripts/verify_migration.exs
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Verification failed${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Migration Test Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
