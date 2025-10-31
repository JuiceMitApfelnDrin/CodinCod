# E2E Testing Library

This library contains end-to-end tests for CodinCod using Playwright with a Page Object Model (POM) design pattern.

## Structure

```
e2e/
├── src/
│   ├── pages/          # Page Object Models
│   │   ├── base.page.ts
│   │   ├── auth.page.ts
│   │   ├── multiplayer.page.ts
│   │   └── game.page.ts
│   ├── fixtures/       # Test fixtures and setup
│   │   └── base.fixtures.ts
│   └── utils/          # Test utilities and helpers
│       └── test-helpers.ts
├── tests/              # Test specifications
│   ├── auth.spec.ts
│   ├── multiplayer.spec.ts
│   └── game.spec.ts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Installation

Install dependencies:

```bash
pnpm install
```

Install Playwright browsers:

```bash
pnpm exec playwright install
```

## Running Tests

Run all tests:
```bash
pnpm test
```

Run with UI mode (recommended for development):
```bash
pnpm test:ui
```

Run in headed mode (see browser):
```bash
pnpm test:headed
```

Debug tests:
```bash
pnpm test:debug
```

Run specific test types:
```bash
pnpm test:e2e          # E2E tests only
pnpm test:api          # API tests only
pnpm test:multiplayer  # Multiplayer tests only
```

View test report:
```bash
pnpm test:report
```

## Writing Tests

### Page Object Model

All page interactions should go through Page Object Models (POMs) located in `src/pages/`.

Example:
```typescript
import { test, expect } from '@/fixtures/base.fixtures';

test('my test', async ({ multiplayerPage }) => {
  await multiplayerPage.gotoMultiplayer();
  await multiplayerPage.hostQuickRoom();
  
  expect(await multiplayerPage.isInRoom()).toBe(true);
});
```

### Test Tags

Use tags to categorize tests:
- `@e2e` - End-to-end tests
- `@api` - API validation tests
- `@multiplayer` - Multiplayer-specific tests

### Multiplayer Tests

For tests requiring multiple players, use the `MultiplayerTestHelper`:

```typescript
import { MultiplayerTestHelper } from '@/utils/test-helpers';

test('multiplayer test', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  // ... setup players
  
  try {
    // ... test logic
  } finally {
    await context1.close();
    await context2.close();
  }
});
```

## Configuration

Test configuration is in `playwright.config.ts`. Key settings:

- `baseURL`: Frontend URL (default: http://localhost:5173)
- `workers`: Number of parallel workers
- `retries`: Number of retries on failure
- `webServer`: Auto-start dev server if not running

Environment variables:
- `BASE_URL`: Override base URL
- `CI`: Enable CI mode (more retries, etc.)
- `SKIP_WEB_SERVER`: Skip auto-starting web server

## Best Practices

1. **Use Page Objects**: Never interact with page directly in tests
2. **Wait Properly**: Use built-in waits, avoid hardcoded timeouts
3. **Isolate Tests**: Each test should be independent
4. **Clean Up**: Always clean up contexts/pages in multiplayer tests
5. **Descriptive Names**: Test names should describe what they test
6. **Single Assertion Focus**: Each test should verify one behavior

## Debugging

- Use `test.only()` to run a single test
- Use `page.pause()` to pause execution
- Use `--debug` flag to step through tests
- Check screenshots in `test-results/` on failure
- View traces in Playwright UI

## API Validation Tests

API tests validate that backend responses match Zod schemas. These tests:

1. Fetch data from API endpoints
2. Validate against Zod schemas from `types` package
3. Test with random database entries
4. Ensure type safety between frontend and backend

Example:
```typescript
test('should validate user API response', async ({ request }) => {
  const response = await request.get('/api/user/testuser');
  const data = await response.json();
  
  // Validate against Zod schema
  const result = userDtoSchema.safeParse(data);
  expect(result.success).toBe(true);
});
```
