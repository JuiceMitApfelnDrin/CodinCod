import { z } from "zod";
import { objectIdSchema } from "../../core/common/schema/object-id.js";
import { solutionSchema } from "../../core/puzzle/schema/solution.schema.js";

// GET /puzzle/languages - Get available programming languages
export const getLanguagesRequestSchema = z.object({});
export const getLanguagesSuccessResponseSchema = z.object({
	languages: z.array(
		z.object({
			name: z.string(),
			version: z.string(),
			aliases: z.array(z.string()).optional(),
		}),
	),
});

// GET /puzzle/:id/solution - Get puzzle solution (authenticated authors only)
export const getPuzzleSolutionRequestSchema = z.object({
	id: objectIdSchema,
});
export const getPuzzleSolutionSuccessResponseSchema = solutionSchema;

// PUT /puzzle/:id/solution - Update puzzle solution
export const updatePuzzleSolutionRequestSchema = z.object({
	id: objectIdSchema,
	solution: solutionSchema,
});
export const updatePuzzleSolutionSuccessResponseSchema = solutionSchema;

// Types
export type GetLanguagesRequest = z.infer<typeof getLanguagesRequestSchema>;
export type GetLanguagesSuccessResponse = z.infer<
	typeof getLanguagesSuccessResponseSchema
>;

export type GetPuzzleSolutionRequest = z.infer<
	typeof getPuzzleSolutionRequestSchema
>;
export type GetPuzzleSolutionSuccessResponse = z.infer<
	typeof getPuzzleSolutionSuccessResponseSchema
>;

export type UpdatePuzzleSolutionRequest = z.infer<
	typeof updatePuzzleSolutionRequestSchema
>;
export type UpdatePuzzleSolutionSuccessResponse = z.infer<
	typeof updatePuzzleSolutionSuccessResponseSchema
>;
