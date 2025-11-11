# E2E Test Suite

This directory contains end-to-end tests for CodinCod, organized by feature area.

## Structure

```
tests/
├── auth/              # Authentication & authorization tests
│   ├── login.spec.ts          # Login flow tests
│   ├── registration.spec.ts   # User registration tests
│   ├── session.spec.ts        # Session management tests
│   ├── protection.spec.ts     # Route protection tests
│   ├── auth.setup.ts          # Auth setup utilities
│   └── register.setup.ts      # Registration setup utilities
│
├── multiplayer/       # Multiplayer game tests
│   ├── basic.spec.ts          # Basic navigation & UI
│   ├── rooms.spec.ts          # Room creation & management
│   ├── chat.spec.ts           # In-game chat
│   ├── game-2player.spec.ts   # 2-player game scenarios
│   ├── game-flow.spec.ts      # Complete game flows
│   ├── game-start.spec.ts     # Game initialization
│   ├── late-join.spec.ts      # Joining ongoing games
│   ├── room-lifecycle.spec.ts # Room state management
│   └── websocket.spec.ts      # WebSocket connection tests
│
├── puzzles/           # Puzzle-related tests
│   └── comprehensive.spec.ts  # Puzzle CRUD, solving, filtering
│
├── profiles/          # User profile tests
│   └── settings.spec.ts       # Profile & settings management
│
├── leaderboards/      # Leaderboard tests
│   └── comprehensive.spec.ts  # Rankings, scores, filtering
│
├── gameplay/          # Single-player gameplay tests
│   └── comprehensive.spec.ts  # Puzzle solving, submissions
│
├── navigation/        # General navigation tests
│   └── pages.spec.ts          # Public page access
│
└── global.teardown.ts # Global cleanup after all tests
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests by feature
```bash
pnpm test tests/auth/           # Auth tests only
pnpm test tests/multiplayer/    # Multiplayer tests only
pnpm test tests/puzzles/        # Puzzle tests only
```

### Run specific test file
```bash
pnpm test tests/auth/login.spec.ts
```

### Run tests with specific tag
```bash
pnpm test --grep @smoke          # Smoke tests only
pnpm test --grep @auth           # Auth-tagged tests
pnpm test --grep @multiplayer    # Multiplayer tests
```

## Test Guidelines

### Writing Tests
- **Use test IDs**: Always use constants from `@codincod/shared/constants/test-ids`
- **Use Page Objects**: Interact through page objects in `src/pages/*`
- **Unique users**: Each test creates unique users via `generateTestUsername()`
- **Parallel-safe**: Tests run in parallel - avoid shared state
- **Descriptive names**: Test names should clearly describe the scenario
- **Tags**: Add appropriate tags (@e2e, @smoke, @auth, @multiplayer, etc.)

### Test Structure
```typescript
test.describe("Feature - Component", () => {
	test("should do something specific @e2e @tag", async ({ page, authPage }) => {
		// Arrange
		await authPage.gotoRegister();
		const username = generateTestUsername();
		
		// Act
		await authPage.register(username, TEST_PASSWORD);
		
		// Assert
		await expect(page).toHaveURL(/\/dashboard/);
	});
});
```

### Timeouts
- Default: 30 seconds (configured in `playwright.config.ts`)
- WebSocket tests: 20-25 seconds (use `test.setTimeout()`)
- Adjust per-test if needed: `test.setTimeout(45_000)`

### Known Issues
- **WebSocket tests**: Require backend running on port 4000
- **Auth tests**: Some validation errors may need frontend fixes
- **Multiplayer**: Full 2-player tests need coordinated browser contexts

## Fixtures
Custom fixtures available in `@/fixtures/base.fixtures`:
- `authPage`: AuthPage instance for login/register
- `multiplayerPage`: MultiplayerPage instance
- `gamePage`: GamePage instance

## CI/CD
Tests run automatically on:
- Pull requests
- Pushes to main branch
- Uses 4 parallel workers
- Retries failed tests once

## Maintenance
- Update test IDs when UI changes
- Keep Page Objects in sync with frontend
- Document new fixtures in this README
- Remove obsolete tests promptly
