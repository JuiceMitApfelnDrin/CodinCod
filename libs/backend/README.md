# Backend

A Node.js backend API built with [Fastify](https://fastify.dev/), MongoDB, and TypeScript. This backend provides REST endpoints for a coding challenge platform.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

## Architecture Overview

### Key Technologies

- **Node.js 20+** - Runtime environment
- **TypeScript** - Type-safe development
- **Fastify** - Web framework
- **Mongoose** - MongoDB ODM
- **Zod** - Schema validation (shared via `types` package)
- **Piston** - Code execution service

## Getting Started

### Prerequisites

1. **Node.js 20+** and **pnpm** installed
2. **MongoDB** running locally or accessible via connection string
3. **Piston service** running (for code execution features and seeding the database)

### Setup Steps

1. **Install dependencies** using pnpm (workspace-aware):

   ```bash
   pnpm install
   ```

2. **Set up environment variables** (see [Environment Variables](#environment-variables))

3. **Run database migrations** (creates collections and populates initial data):

   ```bash
   pnpm migrate
   ```

4. **Seed test data** (optional, for development):

   ```bash
   pnpm seed
   ```

5. **Start development server**:

   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:<PORT>` (default: 8888)

## Environment Variables

Create a `.env` file in `libs/backend/` based on `.env.example`:
