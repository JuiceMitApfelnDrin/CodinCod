import { z } from "zod";
import { gameModeSchema } from "../../../game/schema/mode.schema.js";
import { leaderboardEntrySchema } from "../../../leaderboard/schema/leaderboard-entry.schema.js";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { PAGINATION_CONFIG } from "../../../common/config/pagination.js";

/**
 * GET /leaderboard/:gameMode - Get leaderboard for a specific game mode
 */
export const getLeaderboardRequestSchema = z.object({
	gameMode: gameModeSchema,
	page: z.number().int().positive().default(PAGINATION_CONFIG.DEFAULT_PAGE),
	pageSize: z
		.number()
		.int()
		.positive()
		.max(PAGINATION_CONFIG.MAX_LIMIT)
		.default(PAGINATION_CONFIG.DEFAULT_LIMIT_LEADERBOARD),
});

export const getLeaderboardResponseSchema = z
	.object({
		gameMode: gameModeSchema,
		entries: z.array(leaderboardEntrySchema),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
		totalEntries: z.number().int().nonnegative(),
		totalPages: z.number().int().nonnegative(),
		lastUpdated: z.date().or(z.string()),
	})
	.or(errorResponseSchema);

export type GetLeaderboardRequest = z.infer<typeof getLeaderboardRequestSchema>;
export type GetLeaderboardResponse = z.infer<
	typeof getLeaderboardResponseSchema
>;

/**
 * GET /leaderboard/user/:userId - Get user's rankings across all game modes
 */
export const getUserLeaderboardStatsRequestSchema = z.object({
	userId: z.string(),
});

export const getUserLeaderboardStatsResponseSchema = z
	.object({
		userId: z.string(),
		username: z.string(),
		rankings: z.record(
			z.string(), // Game mode as string key
			z.object({
				rank: z.number().int().positive().optional(),
				rating: z.number(),
				gamesPlayed: z.number().int().nonnegative(),
				winRate: z.number().min(0).max(1),
			}),
		),
	})
	.or(errorResponseSchema);

export type GetUserLeaderboardStatsRequest = z.infer<
	typeof getUserLeaderboardStatsRequestSchema
>;
export type GetUserLeaderboardStatsResponse = z.infer<
	typeof getUserLeaderboardStatsResponseSchema
>;
