import { gameModeEnum, type GameMode } from "types";

/**
 * Submission data for scoring and comparison
 */
export interface SubmissionData {
	successRate: number;
	timeSpent: number;
	codeLength?: number;
	attempts?: number | undefined;
}

/**
 * Game mode configuration
 */
export interface GameModeConfig {
	displayMetrics: string[];
	calculateScore: (submission: SubmissionData) => number;
	compareSubmissions: (a: SubmissionData, b: SubmissionData) => number;
}

/**
 * Calculate score for FASTEST mode
 * Score is inversely proportional to time spent
 */
function calculateFastestScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	return 1000000 / submission.timeSpent;
}

/**
 * Compare submissions for FASTEST mode
 * Priority: success rate > time
 */
function compareFastestSubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	return a.timeSpent - b.timeSpent;
}

/**
 * Calculate score for SHORTEST mode
 * Score is inversely proportional to code length
 */
function calculateShortestScore(submission: SubmissionData): number {
	if (submission.successRate < 1 || !submission.codeLength) return 0;
	return 1000000 / submission.codeLength;
}

/**
 * Compare submissions for SHORTEST mode
 * Priority: success rate > code length > time
 */
function compareShortestSubmissions(
	a: SubmissionData,
	b: SubmissionData
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

/**
 * Calculate score for BACKWARDS mode
 * Solve from output to input - scoring based on logical steps
 * Same as FASTEST but with bonus for fewer attempts
 */
function calculateBackwardsScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	const baseScore = 1000000 / submission.timeSpent;
	const attemptPenalty = (submission.attempts ?? 1) * 0.1;
	return baseScore * (1 - attemptPenalty);
}

/**
 * Compare submissions for BACKWARDS mode
 * Priority: success rate > attempts > time
 */
function compareBackwardsSubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	const aAttempts = a.attempts ?? 1;
	const bAttempts = b.attempts ?? 1;
	if (aAttempts !== bAttempts) {
		return aAttempts - bAttempts;
	}
	return a.timeSpent - b.timeSpent;
}

/**
 * Calculate score for HARDCORE mode
 * One attempt only - binary score
 */
function calculateHardcoreScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	if ((submission.attempts ?? 1) > 1) return 0; // Failed - multiple attempts
	return 1000000 / submission.timeSpent; // Succeeded on first try
}

/**
 * Compare submissions for HARDCORE mode
 * Priority: success on first attempt > time
 */
function compareHardcoreSubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	const aSuccess = a.successRate === 1 && (a.attempts ?? 1) === 1 ? 1 : 0;
	const bSuccess = b.successRate === 1 && (b.attempts ?? 1) === 1 ? 1 : 0;

	if (aSuccess !== bSuccess) {
		return bSuccess - aSuccess;
	}
	if (aSuccess === 0) return 0; // Both failed
	return a.timeSpent - b.timeSpent;
}

/**
 * Calculate score for DEBUG mode
 * Fix broken code - bonus for fewer changes
 */
function calculateDebugScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	const baseScore = 1000000 / submission.timeSpent;
	// Smaller code changes = higher score (assume original code is baseline)
	const changeFactor = submission.codeLength
		? Math.max(0.5, 1 - submission.codeLength / 10000)
		: 1;
	return baseScore * changeFactor;
}

/**
 * Compare submissions for DEBUG mode
 * Priority: success rate > fewer changes > time
 */
function compareDebugSubmissions(a: SubmissionData, b: SubmissionData): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	const aLength = a.codeLength ?? Number.MAX_SAFE_INTEGER;
	const bLength = b.codeLength ?? Number.MAX_SAFE_INTEGER;
	if (aLength !== bLength) {
		return aLength - bLength; // Fewer changes is better
	}
	return a.timeSpent - b.timeSpent;
}

/**
 * Calculate score for EFFICIENCY mode
 * Focus on computational efficiency (simulated by code quality metrics)
 */
function calculateEfficiencyScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	// Efficiency approximated by code length and time
	// Shorter, faster code = more efficient
	const timeComponent = 1000000 / submission.timeSpent;
	const lengthComponent = submission.codeLength
		? 500000 / submission.codeLength
		: 0;
	return timeComponent * 0.4 + lengthComponent * 0.6;
}

/**
 * Compare submissions for EFFICIENCY mode
 * Priority: success rate > efficiency score
 */
function compareEfficiencySubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	const aScore = calculateEfficiencyScore(a);
	const bScore = calculateEfficiencyScore(b);
	return bScore - aScore;
}

/**
 * Calculate score for TYPERACER mode
 * Copy code perfectly, fastest wins
 */
function calculateTyperacerScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	// Pure speed - character per second rate
	const charsPerSecond = (submission.codeLength ?? 0) / submission.timeSpent;
	return charsPerSecond * 1000;
}

/**
 * Compare submissions for TYPERACER mode
 * Priority: success rate > typing speed (chars/sec)
 */
function compareTyperacerSubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	const aSpeed = (a.codeLength ?? 0) / a.timeSpent;
	const bSpeed = (b.codeLength ?? 0) / b.timeSpent;
	return bSpeed - aSpeed;
}

/**
 * Calculate score for INCREMENTAL mode
 * Requirements added each minute - handle complexity over time
 */
function calculateIncrementalScore(submission: SubmissionData): number {
	// Allow partial success in incremental mode (requirements build over time)
	if (submission.successRate === 0) return 0;
	// Score decreases with time (earlier completion = higher score)
	const timeDecayFactor = Math.max(0.1, 1 - submission.timeSpent / 3600);
	return 1000000 * submission.successRate * timeDecayFactor;
}

/**
 * Compare submissions for INCREMENTAL mode
 * Priority: success rate > earlier completion time
 */
function compareIncrementalSubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	// Earlier completion wins
	return a.timeSpent - b.timeSpent;
}

/**
 * Calculate score for LEGACY_MODE
 * Must maintain backwards compatibility - fewer changes to working code
 * NOTE: LEGACY_MODE has been removed from gameModeEnum but kept for backwards compatibility
 */
export function calculateLegacyScore(submission: SubmissionData): number {
	if (submission.successRate < 1) return 0;
	// Reward minimal changes and fast completion
	const baseScore = 1000000 / submission.timeSpent;
	const changeBonus = submission.codeLength
		? Math.max(0.5, 1 - submission.codeLength / 5000)
		: 0.5;
	return baseScore * (0.5 + changeBonus * 0.5);
}

/**
 * Default scoring and comparison for unsupported modes
 */
function calculateDefaultScore(submission: SubmissionData): number {
	return submission.successRate === 1 ? 1000000 / submission.timeSpent : 0;
}

function compareDefaultSubmissions(
	a: SubmissionData,
	b: SubmissionData
): number {
	if (a.successRate !== b.successRate) {
		return b.successRate - a.successRate;
	}
	return a.timeSpent - b.timeSpent;
}

/**
 * Game mode configurations using functional composition
 * Each mode defines its scoring logic, comparison function, and display metrics
 */
const gameModeConfigs: Record<GameMode, GameModeConfig> = {
	[gameModeEnum.FASTEST]: {
		displayMetrics: ["score", "time"],
		calculateScore: calculateFastestScore,
		compareSubmissions: compareFastestSubmissions
	},
	[gameModeEnum.SHORTEST]: {
		displayMetrics: ["score", "length", "time"],
		calculateScore: calculateShortestScore,
		compareSubmissions: compareShortestSubmissions
	},
	[gameModeEnum.BACKWARDS]: {
		displayMetrics: ["score", "attempts", "time"],
		calculateScore: calculateBackwardsScore,
		compareSubmissions: compareBackwardsSubmissions
	},
	[gameModeEnum.HARDCORE]: {
		displayMetrics: ["score", "time", "attempts"],
		calculateScore: calculateHardcoreScore,
		compareSubmissions: compareHardcoreSubmissions
	},
	[gameModeEnum.DEBUG]: {
		displayMetrics: ["score", "changes", "time"],
		calculateScore: calculateDebugScore,
		compareSubmissions: compareDebugSubmissions
	},
	[gameModeEnum.EFFICIENCY]: {
		displayMetrics: ["score", "efficiency", "time", "length"],
		calculateScore: calculateEfficiencyScore,
		compareSubmissions: compareEfficiencySubmissions
	},
	[gameModeEnum.TYPERACER]: {
		displayMetrics: ["score", "speed", "time"],
		calculateScore: calculateTyperacerScore,
		compareSubmissions: compareTyperacerSubmissions
	},
	[gameModeEnum.INCREMENTAL]: {
		displayMetrics: ["score", "time", "completion"],
		calculateScore: calculateIncrementalScore,
		compareSubmissions: compareIncrementalSubmissions
	},
	[gameModeEnum.RANDOM]: {
		displayMetrics: ["score", "time"],
		calculateScore: calculateDefaultScore,
		compareSubmissions: compareDefaultSubmissions
	}
};

/**
 * Get game mode configuration for a specific mode
 * Uses functional approach with switch statement for clarity
 */
export function getGameModeConfig(mode: GameMode): GameModeConfig {
	switch (mode) {
		case gameModeEnum.FASTEST:
		case gameModeEnum.SHORTEST:
		case gameModeEnum.BACKWARDS:
		case gameModeEnum.HARDCORE:
		case gameModeEnum.DEBUG:
		case gameModeEnum.EFFICIENCY:
		case gameModeEnum.TYPERACER:
		case gameModeEnum.INCREMENTAL:
		case gameModeEnum.RANDOM:
			return gameModeConfigs[mode];
		default:
			// Exhaustiveness check
			const exhaustiveCheck: never = mode;
			console.warn(`Unknown game mode: ${exhaustiveCheck}, using default`);
			return gameModeConfigs[gameModeEnum.FASTEST];
	}
}

/**
 * Calculate score for a submission based on game mode
 */
export function calculateScore(
	mode: GameMode,
	submission: SubmissionData
): number {
	const config = getGameModeConfig(mode);
	return config.calculateScore(submission);
}

/**
 * Get display metrics for a game mode
 */
export function getDisplayMetrics(mode: GameMode): string[] {
	const config = getGameModeConfig(mode);
	return config.displayMetrics;
}

/**
 * Sort submissions by game mode using functional composition
 */
export function sortSubmissionsByGameMode<
	T extends {
		result: { successRate: number };
		createdAt: Date | string;
		codeLength?: number;
		attempts?: number;
	}
>(submissions: T[], mode: GameMode, gameStartTime: Date | string): T[] {
	const config = getGameModeConfig(mode);
	const startTime = new Date(gameStartTime).getTime();

	return [...submissions].sort((a, b) => {
		const aTime = (new Date(a.createdAt).getTime() - startTime) / 1000;
		const bTime = (new Date(b.createdAt).getTime() - startTime) / 1000;

		const aData: SubmissionData = {
			successRate: a.result.successRate,
			timeSpent: aTime,
			...(a.codeLength !== undefined && { codeLength: a.codeLength }),
			...(a.attempts !== undefined && { attempts: a.attempts })
		};

		const bData: SubmissionData = {
			successRate: b.result.successRate,
			timeSpent: bTime,
			...(b.codeLength !== undefined && { codeLength: b.codeLength }),
			...(b.attempts !== undefined && { attempts: b.attempts })
		};

		return config.compareSubmissions(aData, bData);
	});
}
