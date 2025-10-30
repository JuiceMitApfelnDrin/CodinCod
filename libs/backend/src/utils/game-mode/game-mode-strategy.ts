import { gameModeEnum, type GameMode } from "types";

export interface GameModeStrategy {
	calculateScore(submission: {
		successRate: number;
		timeSpent: number;
		codeLength?: number;
	}): number;

	compareSubmissions(
		a: { successRate: number; timeSpent: number; codeLength?: number },
		b: { successRate: number; timeSpent: number; codeLength?: number }
	): number;

	getDisplayMetrics(): string[];
}

class FastestModeStrategy implements GameModeStrategy {
	calculateScore(submission: {
		successRate: number;
		timeSpent: number;
	}): number {
		if (submission.successRate < 1) return 0;
		return 1000000 / submission.timeSpent;
	}

	compareSubmissions(
		a: { successRate: number; timeSpent: number },
		b: { successRate: number; timeSpent: number }
	): number {
		if (a.successRate !== b.successRate) {
			return b.successRate - a.successRate;
		}
		return a.timeSpent - b.timeSpent;
	}

	getDisplayMetrics(): string[] {
		return ["score", "time"];
	}
}

class ShortestModeStrategy implements GameModeStrategy {
	calculateScore(submission: {
		successRate: number;
		codeLength: number;
	}): number {
		if (submission.successRate < 1 || !submission.codeLength) return 0;
		return 1000000 / submission.codeLength;
	}

	compareSubmissions(
		a: { successRate: number; timeSpent: number; codeLength: number },
		b: { successRate: number; timeSpent: number; codeLength: number }
	): number {
		if (a.successRate !== b.successRate) {
			return b.successRate - a.successRate;
		}
		const aLength = a.codeLength ?? Number.MAX_SAFE_INTEGER;
		const bLength = b.codeLength ?? Number.MAX_SAFE_INTEGER;
		if (aLength !== bLength) {
			return aLength - bLength;
		}
		return a.timeSpent - b.timeSpent;
	}

	getDisplayMetrics(): string[] {
		return ["score", "length", "time"];
	}
}

const strategies: Record<GameMode, GameModeStrategy> = {
	[gameModeEnum.FASTEST]: new FastestModeStrategy(),
	[gameModeEnum.SHORTEST]: new ShortestModeStrategy(),
	[gameModeEnum.RANDOM]: null
};

export function getGameModeStrategy(mode: GameMode): GameModeStrategy {
	return strategies[mode];
}

export function sortSubmissionsByGameMode<
	T extends {
		result: { successRate: number };
		createdAt: Date | string;
		codeLength?: number;
	}
>(submissions: T[], mode: GameMode, gameStartTime: Date | string): T[] {
	const strategy = getGameModeStrategy(mode);
	const startTime = new Date(gameStartTime).getTime();

	return [...submissions].sort((a, b) => {
		const aTime = (new Date(a.createdAt).getTime() - startTime) / 1000;
		const bTime = (new Date(b.createdAt).getTime() - startTime) / 1000;

		return strategy.compareSubmissions(
			{
				successRate: a.result.successRate,
				timeSpent: aTime,
				...(a.codeLength !== undefined && { codeLength: a.codeLength })
			},
			{
				successRate: b.result.successRate,
				timeSpent: bTime,
				...(b.codeLength !== undefined && { codeLength: b.codeLength })
			}
		);
	});
}
