import { z } from "zod";
import { paginatedQuerySchema } from "../../core/common/schema/paginated-query.schema.js";
import { paginatedQueryResponseSchema } from "../../core/common/schema/paginated-query-response.schema.js";
import { puzzleEntitySchema } from "../../core/puzzle/schema/puzzle-entity.schema.js";
import { puzzleDtoSchema } from "../../core/puzzle/schema/puzzle-dto.schema.js";
import { objectIdSchema } from "../../core/common/schema/object-id.js";

// Re-export nested puzzle endpoints
export * from "./nested.js";

// GET /puzzle - List puzzles with pagination
export const listPuzzlesRequestSchema = paginatedQuerySchema;
export const listPuzzlesSuccessResponseSchema =
	paginatedQueryResponseSchema.extend({
		data: z.array(puzzleDtoSchema),
	});

// POST /puzzle - Create a new puzzle
export const createPuzzleRequestSchema = puzzleEntitySchema.omit({
	author: true,
	createdAt: true,
	updatedAt: true,
});
export const createPuzzleSuccessResponseSchema = puzzleEntitySchema;

// GET /puzzle/:id - Get a specific puzzle
export const getPuzzleRequestSchema = z.object({
	id: objectIdSchema,
});
export const getPuzzleSuccessResponseSchema = puzzleDtoSchema;

// PUT /puzzle/:id - Update a puzzle
export const updatePuzzleRequestSchema = z.object({
	id: objectIdSchema,
	data: puzzleEntitySchema.partial().omit({
		author: true,
		createdAt: true,
		updatedAt: true,
	}),
});
export const updatePuzzleSuccessResponseSchema = puzzleEntitySchema;

// DELETE /puzzle/:id - Delete a puzzle
export const deletePuzzleRequestSchema = z.object({
	id: objectIdSchema,
});
export const deletePuzzleSuccessResponseSchema = z.object({
	message: z.string(),
});

// Common error response for all puzzle endpoints
export const puzzleErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

// Types
export type ListPuzzlesRequest = z.infer<typeof listPuzzlesRequestSchema>;
export type ListPuzzlesSuccessResponse = z.infer<
	typeof listPuzzlesSuccessResponseSchema
>;

export type CreatePuzzleRequest = z.infer<typeof createPuzzleRequestSchema>;
export type CreatePuzzleSuccessResponse = z.infer<
	typeof createPuzzleSuccessResponseSchema
>;

export type GetPuzzleRequest = z.infer<typeof getPuzzleRequestSchema>;
export type GetPuzzleSuccessResponse = z.infer<
	typeof getPuzzleSuccessResponseSchema
>;

export type UpdatePuzzleRequest = z.infer<typeof updatePuzzleRequestSchema>;
export type UpdatePuzzleSuccessResponse = z.infer<
	typeof updatePuzzleSuccessResponseSchema
>;

export type DeletePuzzleRequest = z.infer<typeof deletePuzzleRequestSchema>;
export type DeletePuzzleSuccessResponse = z.infer<
	typeof deletePuzzleSuccessResponseSchema
>;

export type PuzzleErrorResponse = z.infer<typeof puzzleErrorResponseSchema>;
