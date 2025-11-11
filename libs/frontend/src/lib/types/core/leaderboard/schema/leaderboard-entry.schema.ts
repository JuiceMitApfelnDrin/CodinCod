import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { glickoRatingSchema } from "./user-metrics.schema.js";

/**
 * Single entry in a leaderboard
 */
export const leaderboardEntrySchema = z.object({
	rank: z.number().int().positive(),
	userId: objectIdSchema,
	username: z.string(),
	rating: z.number(),
	glicko: glickoRatingSchema,
	gamesPlayed: z.number().int().nonnegative(),
	gamesWon: z.number().int().nonnegative(),
	winRate: z.number().min(0).max(1),
	bestScore: z.number().nonnegative(),
	averageScore: z.number().nonnegative()
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
