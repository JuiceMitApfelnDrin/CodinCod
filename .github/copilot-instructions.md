# CodinCod Development Context

## What This Is
Competitive coding platform (LeetCode/Codewars-style) with **real-time multiplayer battles**. Elixir/Phoenix backend + SvelteKit frontend. Monorepo with pnpm workspaces.

## Critical Issues Right Now
1. **Multiplayer is severely broken** - Phoenix Channels unstable, game state desyncs, join/leave failures
2. **Puzzle moderation incomplete** - moderators lack proper review/approval workflow
3. **E2E tests failing** - blocks validation of core features

## Architecture Quick Reference
```
Backend: Elixir/Phoenix (port 4000) - API-only, Phoenix Channels for WebSockets
Frontend: SvelteKit (port 5173) - SSR, file-based routing
Database: PostgreSQL + Ecto ORM
Code Execution: Piston API (sandboxed, 20+ languages)
Testing: Playwright E2E with Page Object Model pattern
```

**Key Patterns:**
- Backend: Phoenix Contexts (Accounts, Games, Puzzles, Submissions, Moderation)
- Real-time: 3-level channels (Lobby → WaitingRoom → Game)
- Frontend: Svelte stores for state, direct imports (NO barrel files)
- Database: Ecto schemas, changesets for validation

## Before Writing Any Code

1. **Search existing codebase** - Function/pattern likely exists already
2. **Identify correct Context** - Which module owns this? (Games? Puzzles? Accounts?)
3. **Check for similar implementations** - Look at related files in same Context
4. **Propose approach** - Explain what you'll change and why
5. **Ask clarifying questions** - Don't assume requirements

## Development Rules

### ✅ Always Do
- **Use constants** from `@codincod/shared/constants/*` (frontendUrls, testIds, gameConfig)
- **Direct imports** - `import { testIds } from "@codincod/shared/constants/test-ids"` ✅
- **Match existing patterns** - Follow conventions in surrounding code
- **Include tests** - ExUnit (backend), Vitest (frontend), Playwright (E2E)
- **Handle errors** - No silent failures, proper error messages
- **kebab-case files** - `user-profile.svelte`, `game-channel.ex`
- **Page Objects for E2E** - Never interact with page directly in tests

### ❌ Never Do
- **Barrel files** - `import from "@codincod/shared"` ❌ (causes circular deps)
- **Duplicate logic** - Search first, reuse existing functions
- **Hardcode values** - URLs, test IDs, timeouts → use constants
- **TODO comments** - Fix it now or create GitHub issue
- **Break backwards compat** - Maintain existing API contracts
- **Skip error handling** - Always handle edge cases
- **Ignore race conditions** - Especially in multiplayer/WebSocket code

## Import Patterns (Critical)
```typescript
// ✅ Correct - direct imports
import { testIds } from "@codincod/shared/constants/test-ids";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import Button from "@/components/ui/button";  // @/* = src/lib/*
import Card from "#/ui/card";                 // #/* = src/lib/components

// ❌ Wrong - NO barrel files
import { testIds } from "@codincod/shared";  // FORBIDDEN
```

## E2E Testing Requirements
- **Use Page Objects** - All interactions through `libs/e2e/src/pages/*`
- **Parallel-safe** - Tests must not interfere with each other
- **Fast feedback** - Avoid excessive waits, use smart locators
- **Fault tolerant** - Handle network delays, animation timings
- **data-testid** - Always use constants from `testIds`
```typescript
// ✅ Good
const authPage = new AuthPage(page);
await authPage.login('user', 'pass');

// ❌ Bad
await page.fill('#username', 'user');  // Direct DOM interaction
```

## Quality Standards
- **Production-ready only** - No hacks, placeholders, or "temporary" solutions
- **Comprehensive fixes** - If fixing one import, fix all similar imports
- **Consistent style** - Match file/module conventions exactly
- **Long-term thinking** - Consider maintenance, scaling, edge cases

## Phoenix/Elixir Specifics
- See `libs/backend/codincod_api/AGENTS.md` for detailed Phoenix patterns
- Context modules are the API boundary - don't bypass them
- Use Ecto changesets for all validations
- Phoenix Channels: handle presence tracking, graceful disconnects
- Background jobs via Oban for emails, analytics, cleanup

## Common Pitfalls
1. **Barrel file imports** → Use direct paths from constants/types
2. **E2E timeout** → Check servers running, avoid `networkidle` wait state
3. **Shared package stale** → Run `pnpm build` in libs/shared after changes
4. **Port conflicts** → Kill processes: `lsof -ti:5173 | xargs kill -9`

## When Proposing Changes
**Answer these before coding:**
1. What Context/module does this belong to?
2. Does similar functionality already exist?
3. How will this handle errors and edge cases?
4. What tests are needed?
5. Are there backwards compatibility concerns?
6. Could this cause race conditions (especially multiplayer)?

## Priority Focus Areas
1. **Multiplayer stability** - Fix WebSocket disconnects, state sync, presence tracking
2. **Puzzle moderation** - Build review UI, approval workflow, feedback system
3. **Test infrastructure** - Make E2E reliable, increase coverage

## MCP Tools Available
You have MCP (Model Context Protocol) tools - use them to search codebase, read files, understand context before making changes.

---

**Goal**: Build production-quality, maintainable code that lasts. No shortcuts. Ask questions. Search before creating.