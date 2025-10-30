# Game Mode Architecture

## Overview

CodinCod uses a **strategy pattern** to handle different game modes. This makes it easy to add new game modes without modifying existing code.

## Current Game Modes

- **FASTEST**: Solve the puzzle as quickly as possible (default for competitive play)
- **SHORTEST**: Solve the puzzle with the least amount of characters (code golf)
- **RATED**: Competitive mode with ELO-style ranking (affects player ratings)
- **CASUAL**: Non-competitive mode (doesn't affect ratings)

## How to Add a New Game Mode

### 1. Add the Mode to the Enum

Update `libs/types/src/core/game/enum/game-mode-enum.ts`:

```typescript
export const gameModeEnum = {
	FASTEST: "fastest",
	SHORTEST: "shortest",
	RATED: "rated",
	CASUAL: "casual",
	YOUR_NEW_MODE: "your_new_mode" // Add your mode here
} as const;
```

### 2. Create a Strategy Class

In `libs/backend/src/utils/game-mode/game-mode-strategy.ts`, create a new strategy:

```typescript
class YourNewModeStrategy implements GameModeStrategy {
	calculateScore(submission: {
		successRate: number;
		timeSpent: number;
		codeLength?: number;
		// Add any custom metrics you need
	}): number {
		// Return a numeric score for the submission
		// Higher is better
		return 0;
	}

	compareSubmissions(
		a: { successRate: number; timeSpent: number; codeLength?: number },
		b: { successRate: number; timeSpent: number; codeLength?: number }
	): number {
		// Return negative if a is better, positive if b is better, 0 if equal
		// This determines leaderboard order
		return 0;
	}

	getDisplayMetrics(): string[] {
		// Return which metrics should be shown in the UI
		return ["score", "yourMetric"];
	}
}
```

### 3. Register the Strategy

Add your strategy to the `strategies` object:

```typescript
const strategies: Record<GameMode, GameModeStrategy> = {
	// ... existing strategies
	[gameModeEnum.YOUR_NEW_MODE]: new YourNewModeStrategy()
};
```

### 4. Add Required Data Fields

If your mode needs new submission data (like `codeLength` for SHORTEST mode):

1. Update `libs/types/src/core/submission/schema/submission-entity.schema.ts`
2. Update `libs/backend/src/models/submission/submission.ts`
3. Update submission routes to calculate/store the data

### 5. Update the Frontend

Update `libs/frontend/src/lib/features/game/standings/components/standings-table.svelte`:

```svelte
{#if game.options.mode === gameModeEnum.YOUR_NEW_MODE}
	<Table.Head>Your Metric</Table.Head>
{/if}
```

## Architecture Benefits

✅ **Extensible**: Add new modes without changing existing code
✅ **Type-safe**: TypeScript ensures all modes are handled
✅ **Testable**: Each strategy can be unit tested independently
✅ **Maintainable**: Mode-specific logic is isolated

## Example: Adding a "Memory Efficient" Mode

1. Add `MEMORY_EFFICIENT: "memory_efficient"` to gameModeEnum
2. Create `MemoryEfficientModeStrategy` that:
   - Tracks peak memory usage during execution
   - Scores based on lowest memory usage + success rate
   - Breaks ties by execution time
3. Add `peakMemoryUsage` field to SubmissionEntity
4. Update Piston execution to capture memory metrics
5. Update standings table to show memory usage column

That's it! The game mode system handles the rest automatically.
