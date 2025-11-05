-- PostgreSQL initialization script
-- This script runs when the PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types if needed
-- (Will be created by Ecto migrations)

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'PostgreSQL extensions initialized successfully';
END $$;
