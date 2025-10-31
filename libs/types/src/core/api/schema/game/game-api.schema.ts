import { z } from "zod";
import { objectIdSchema } from "../../../common/schema/object-id.js";
import { gameEntitySchema } from "../../../game/schema/game-entity.schema.js";
import { gameModeSchema } from "../../../game/schema/mode.schema.js";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { gameVisibilitySchema } from "../../../game/schema/visibility.schema.js";
import { DEFAULT_GAME_LENGTH_IN_SECONDS, MINIMUM_PLAYERS_IN_GAME } from "../../../game/config/game-config.js";
import { PAGINATION_CONFIG } from "../../../common/config/pagination.js";

/**
 * POST /game - Create a new multiplayer game
 */
export const createGameRequestSchema = z.object({
	puzzleId: objectIdSchema.optional(),
	mode: gameModeSchema,
	visibility: gameVisibilitySchema,
	maxPlayers: z.number().int().min(MINIMUM_PLAYERS_IN_GAME),
	timeLimit: z.number().int().min(60).max(DEFAULT_GAME_LENGTH_IN_SECONDS).optional(), // in seconds
});

export const createGameResponseSchema = gameEntitySchema
	.extend({
		inviteCode: z.string().optional(), // For private games
	})
	.or(errorResponseSchema);

export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;

/**
 * GET /game/:id - Get game details
 */
export const getGameByIdRequestSchema = z.object({
	id: objectIdSchema,
});

export const getGameByIdResponseSchema =
	gameEntitySchema.or(errorResponseSchema);

export type GetGameByIdRequest = z.infer<typeof getGameByIdRequestSchema>;
export type GetGameByIdResponse = z.infer<typeof getGameByIdResponseSchema>;

/**
 * GET /game - List available games
 */
export const listGamesRequestSchema = z.object({
	visibility: gameVisibilitySchema.optional(),
	mode: gameModeSchema.optional(),
	status: z.enum(["waiting", "in_progress", "completed"]).optional(),
	page: z.number().int().positive().default(PAGINATION_CONFIG.DEFAULT_PAGE),
	pageSize: z.number().int().positive().max(PAGINATION_CONFIG.MAX_LIMIT).default(PAGINATION_CONFIG.DEFAULT_LIMIT),
});

export const listGamesResponseSchema = z
	.object({
		items: z.array(gameEntitySchema),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
		totalPages: z.number().int().nonnegative(),
		totalItems: z.number().int().nonnegative(),
	})
	.or(errorResponseSchema);

export type ListGamesRequest = z.infer<typeof listGamesRequestSchema>;
export type ListGamesResponse = z.infer<typeof listGamesResponseSchema>;

/**
 * POST /game/:id/join - Join a game
 */
export const joinGameRequestSchema = z.object({
	gameId: objectIdSchema,
	inviteCode: z.string().optional(),
});

export const joinGameResponseSchema = z
	.object({
		success: z.boolean(),
		message: z.string(),
		game: gameEntitySchema.optional(),
	})
	.or(errorResponseSchema);

export type JoinGameRequest = z.infer<typeof joinGameRequestSchema>;
export type JoinGameResponse = z.infer<typeof joinGameResponseSchema>;

/**
 * POST /game/:id/leave - Leave a game
 */
export const leaveGameRequestSchema = z.object({
	gameId: objectIdSchema,
});

export const leaveGameResponseSchema = z
	.object({
		success: z.boolean(),
		message: z.string(),
	})
	.or(errorResponseSchema);

export type LeaveGameRequest = z.infer<typeof leaveGameRequestSchema>;
export type LeaveGameResponse = z.infer<typeof leaveGameResponseSchema>;

/**
 * POST /game/:id/start - Start a game (host only)
 */
export const startGameRequestSchema = z.object({
	gameId: objectIdSchema,
});

export const startGameResponseSchema = z
	.object({
		success: z.boolean(),
		message: z.string(),
		startTime: z.date().or(z.string()).optional(),
	})
	.or(errorResponseSchema);

export type StartGameRequest = z.infer<typeof startGameRequestSchema>;
export type StartGameResponse = z.infer<typeof startGameResponseSchema>;
