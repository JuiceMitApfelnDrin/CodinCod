import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { gameModeSchema } from "../../game/schema/mode.schema.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

/**
 * Glicko-2 rating components
 */
export const glickoRatingSchema = z.object({
	rating: z.number().default(1500), // Base rating
	rd: z.number().default(350), // Rating deviation
	volatility: z.number().default(0.06), // Volatility
	lastUpdated: acceptedDateSchema.default(() => new Date()),
});

export type GlickoRating = z.infer<typeof glickoRatingSchema>;

/**
 * User metrics per game mode
 */
export const gameModeMetricsSchema = z.object({
	gamesPlayed: z.number().int().nonnegative().default(0),
	gamesWon: z.number().int().nonnegative().default(0),
	bestScore: z.number().nonnegative().default(0),
	averageScore: z.number().nonnegative().default(0),
	totalScore: z.number().nonnegative().default(0),
	glickoRating: glickoRatingSchema,
	rank: z.number().int().positive().optional(), // Position in leaderboard
	lastGameDate: acceptedDateSchema.optional(),
});

export type GameModeMetrics = z.infer<typeof gameModeMetricsSchema>;

/**
 * User metrics entity - stores aggregated performance data
 */
export const userMetricsEntitySchema = z.object({
	_id: objectIdSchema.optional(),
	userId: objectIdSchema,

	// Metrics per game mode
	fastest: gameModeMetricsSchema.optional(),
	shortest: gameModeMetricsSchema.optional(),
	backwards: gameModeMetricsSchema.optional(),
	hardcore: gameModeMetricsSchema.optional(),
	debug: gameModeMetricsSchema.optional(),
	typeracer: gameModeMetricsSchema.optional(),
	efficiency: gameModeMetricsSchema.optional(),
	incremental: gameModeMetricsSchema.optional(),
	random: gameModeMetricsSchema.optional(),

	// Overall stats
	totalGamesPlayed: z.number().int().nonnegative().default(0),
	totalGamesWon: z.number().int().nonnegative().default(0),

	// Tracking for incremental updates
	lastProcessedGameDate: acceptedDateSchema.default(() => new Date(0)), // Epoch
	lastCalculationDate: acceptedDateSchema.default(() => new Date()),

	createdAt: acceptedDateSchema.default(() => new Date()),
	updatedAt: acceptedDateSchema.default(() => new Date()),
});

export type UserMetricsEntity = z.infer<typeof userMetricsEntitySchema>;
