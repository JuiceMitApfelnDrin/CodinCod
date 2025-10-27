# CodinCod# CodinCod

A fun, open-source platform that makes coding fun through gamified challenges and multiplayer.

## Table of contents



## Table of Contents

- [Features](#features)
- [Quick Start Guide](#quick-start-guide)
- [Resources](#resources)


## Features

✨ **Coding Challenges**: Solve puzzles in 20+ programming languages

🏆 **Multiplayer Games**: Compete in real-time coding competitions  

📊 **Progress Tracking**: Track your skills and achievements

🎨 **In-Browser Editor**: Write and test code without leaving the browser  

🔧 **Community-Driven**: Built by developers, for developers

## Quick Start Guide  

This guide will get you up and running in ~10 minutes, even if you're new to development.

### Prerequisites

2. Clone the project structure and its submodules:

Before you begin, make sure you have these installed on your computer:


1. **Git** - For cloning the repository 

   📥 [Download Git](https://git-scm.com/download/)   ```



2. **Node.js 18+** - JavaScript runtime

   📥 [Download Node.js](https://nodejs.org/en/download/) (get the LTS version)

  
3. **pnpm** - Package manager (faster than npm)   

   After installing Node.js, run: 

   ```bash

   npm install -g pnpm   ```

   ```

4. **MongoDB** - Database (choose ONE option):
   - **Option A (Recommended for beginners)**: Use Docker (see step 3 below)
   - **Option B**: Install locally - [MongoDB Community](https://www.mongodb.com/try/download/community)
   - **Option C**: Use cloud - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free tier)

5. **Piston** - Code execution service (we'll set this up with Docker)  
   📥 [Docker Desktop](https://www.docker.com/products/docker-desktop/) (easiest way to run Piston)

### Step-by-Step Setup

#### 1. Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal app) and run:

```bash
git clone https://github.com/JuiceMitApfelnDrin/CodinCod
cd CodinCod
```

This downloads the code to your computer and navigates into the folder.

#### 2. Install Dependencies

We use a **monorepo** structure (all code in one repository, organized in separate packages). Let's install everything:

```bash
pnpm install
```

This command:
- Installs dependencies for all packages (backend, frontend, types)
- Sets up workspace links between packages

#### 3. Start MongoDB & Piston (Docker)

If you have Docker Desktop installed (recommended):

```bash
docker compose up -d
```

This starts:
- **MongoDB** on `localhost:27017` (database)
- **Piston** on `localhost:2000` (code execution service)

The `-d` flag runs them in the background (detached mode).

**Verify it's running:**
```bash
docker compose ps
```

You should see both services "Up".

#### 4. Set Up Environment Variables



#### 5. Build Shared Types

The `types` package contains TypeScript schemas shared between frontend and backend. Build it first:

```bash
cd libs/types
pnpm build
cd ../..
```

Or from the root directory:

```bash
pnpm --filter types build
```

#### 6. Run Database Migrations

Migrations set up the database schema and populate initial data (like programming languages):

```bash
cd libs/backend
pnpm migrate
```

This creates:
- Database collections (users, puzzles, submissions, etc.)
- ProgrammingLanguage documents from Piston runtimes
- Indexes for performance

#### 7. Seed Test Data (Optional, Recommended for Development)

To populate your database with "realistic" test data:

```bash
pnpm seed
```

**Why?** It's much easier to develop and test features when you have data to work with!

#### 8. Start the Backend

From `libs/backend`:

```bash
pnpm dev
```

**Keep this terminal open!** The backend needs to stay running.

#### 9. Start the Frontend (New Terminal)

Open a **new terminal** and run:

```bash
cd libs/frontend
pnpm dev
```

#### 10. Open in Browser

Navigate to: **http://localhost:5173**

🎉 **You're done!** You should see the CodinCod home page.

### What Just Happened?

You now have a full-stack application running:

1. **Frontend** (`localhost:5173`) - SvelteKit web app you interact with
2. **Backend** (`localhost:8888`) - Fastify API server handling requests
3. **MongoDB** (`localhost:27017`) - Database storing users, puzzles, etc.
4. **Piston** (`localhost:2000`) - Service that safely executes user code

### Next Steps

- **Explore the app**: Create an account, solve a puzzle, view your profile
- **Check the docs**:
  - [Backend README](./libs/backend/README.md) - API routes, migrations, architecture
  - [Frontend README](./libs/frontend/README.md) - SvelteKit, components, routing
- **Make changes**: Edit a file, save, and watch it hot-reload in the browser!

## Resources

### Documentation

- **Backend README**: [libs/backend/README.md](./libs/backend/README.md)
- **Frontend README**: [libs/frontend/README.md](./libs/frontend/README.md)
- **Online Docs**: [codincod.com/docs](https://codincod.com/docs)

### Community

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions, share ideas

---

**Happy coding!** 🚀 If you get stuck, don't hesitate to ask for help in discussions or issues.
