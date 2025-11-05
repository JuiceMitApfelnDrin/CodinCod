/**
 * Leaderboard configuration and thresholds
 */
export const LEADERBOARD_CONFIG = {
	RATING_THRESHOLDS: {
		LEGENDARY: 2000,
		MASTER: 1800,
		EXPERT: 1600,
		ADVANCED: 1400,
		BEGINNER: 0,
	},
	COLORS: {
		LEGENDARY: "text-purple-600 dark:text-purple-400",
		MASTER: "text-blue-600 dark:text-blue-400",
		EXPERT: "text-green-600 dark:text-green-400",
		ADVANCED: "text-yellow-600 dark:text-yellow-400",
		BEGINNER: "text-gray-600 dark:text-gray-400",
	},
	MEDALS: {
		FIRST: "🥇",
		SECOND: "🥈",
		THIRD: "🥉",
	},
} as const;
