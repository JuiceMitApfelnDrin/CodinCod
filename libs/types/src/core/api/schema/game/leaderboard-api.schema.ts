import { z } from "zod";
import { objectIdSchema } from "../../../common/schema/object-id.js";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { gameModeSchema } from "../../../game/schema/mode.schema.js";
import { acceptedDateSchema } from "../../../common/schema/accepted-date.js";

/**
 * GET /game/:id/leaderboard - Get ranked leaderboard for a game
 */
export const getGameLeaderboardRequestSchema = z.object({
	gameId: objectIdSchema,
});

export const getGameLeaderboardResponseSchema = z
	.object({
		gameId: objectIdSchema,
		mode: gameModeSchema,
		leaderboard: z.array(
			z.object({
				userId: objectIdSchema,
				username: z.string(),
				score: z.number(),
				timeSpent: z.number(), // in seconds
				codeLength: z.number().int().nonnegative().optional(),
				successRate: z.number().min(0).max(1),
				rank: z.number().int().positive(),
				programmingLanguage: z.string().optional(),
			}),
		),
		totalPlayers: z.number().int().nonnegative(),
	})
	.or(errorResponseSchema);

export type GetGameLeaderboardRequest = z.infer<
	typeof getGameLeaderboardRequestSchema
>;
export type GetGameLeaderboardResponse = z.infer<
	typeof getGameLeaderboardResponseSchema
>;

/**
 * GET /game/:id/stats - Get game statistics and metadata
 */
export const getGameStatsRequestSchema = z.object({
	gameId: objectIdSchema,
});

export const getGameStatsResponseSchema = z
	.object({
		gameId: objectIdSchema,
		mode: gameModeSchema,
		description: z.string(),
		displayMetrics: z.array(z.string()),
		playerCount: z.number().int().nonnegative(),
		submissionCount: z.number().int().nonnegative(),
		createdAt: acceptedDateSchema,
		options: z
			.object({
				mode: gameModeSchema,
				maxPlayers: z.number().int().positive(),
				timeLimit: z.number().int().positive().optional(),
			})
			.optional(),
	})
	.or(errorResponseSchema);

export type GetGameStatsRequest = z.infer<typeof getGameStatsRequestSchema>;
export type GetGameStatsResponse = z.infer<typeof getGameStatsResponseSchema>;
