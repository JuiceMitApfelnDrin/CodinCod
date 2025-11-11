import { z } from "zod";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { objectIdSchema } from "../../../common/schema/object-id.js";
import { paginatedQueryResponseSchema } from "../../../common/schema/paginated-query-response.schema.js";
import { paginatedQuerySchema } from "../../../common/schema/paginated-query.schema.js";
import { PUZZLE_CONFIG } from "../../../puzzle/config/puzzle-config.js";
import { puzzleEntitySchema } from "../../../puzzle/schema/puzzle-entity.schema.js";

/**
 * GET /puzzle - List puzzles with pagination
 */
export const getPuzzlesRequestSchema = paginatedQuerySchema;

export const getPuzzlesResponseSchema = paginatedQueryResponseSchema.extend({
	items: z.array(puzzleEntitySchema)
});

export type GetPuzzlesRequest = z.infer<typeof getPuzzlesRequestSchema>;
export type GetPuzzlesResponse = z.infer<typeof getPuzzlesResponseSchema>;

/**
 * GET /puzzle/:id - Get single puzzle by ID
 */
export const getPuzzleByIdRequestSchema = z.object({
	id: objectIdSchema
});

export const getPuzzleByIdResponseSchema =
	puzzleEntitySchema.or(errorResponseSchema);

export type GetPuzzleByIdRequest = z.infer<typeof getPuzzleByIdRequestSchema>;
export type GetPuzzleByIdResponse = z.infer<typeof getPuzzleByIdResponseSchema>;

/**
 * POST /puzzle - Create new puzzle
 */
export const createPuzzleRequestSchema = z.object({
	title: z
		.string()
		.min(PUZZLE_CONFIG.minTitleLength)
		.max(PUZZLE_CONFIG.maxTitleLength),
	description: z.string().min(PUZZLE_CONFIG.minStatementLength),
	difficulty: z.enum(["easy", "medium", "hard"]),
	validators: z
		.array(
			z.object({
				input: z.string(),
				output: z.string()
			})
		)
		.min(1),
	tags: z.array(z.string()).optional()
});

export const createPuzzleResponseSchema =
	puzzleEntitySchema.or(errorResponseSchema);

export type CreatePuzzleRequest = z.infer<typeof createPuzzleRequestSchema>;
export type CreatePuzzleResponse = z.infer<typeof createPuzzleResponseSchema>;

/**
 * PUT /puzzle/:id - Update existing puzzle
 */
export const updatePuzzleRequestSchema = puzzleEntitySchema.partial().extend({
	id: objectIdSchema
});

export const updatePuzzleResponseSchema =
	puzzleEntitySchema.or(errorResponseSchema);

export type UpdatePuzzleRequest = z.infer<typeof updatePuzzleRequestSchema>;
export type UpdatePuzzleResponse = z.infer<typeof updatePuzzleResponseSchema>;

/**
 * DELETE /puzzle/:id - Delete puzzle
 */
export const deletePuzzleRequestSchema = z.object({
	id: objectIdSchema
});

export const deletePuzzleResponseSchema = z.void().or(errorResponseSchema);

export type DeletePuzzleRequest = z.infer<typeof deletePuzzleRequestSchema>;
export type DeletePuzzleResponse = z.infer<typeof deletePuzzleResponseSchema>;
