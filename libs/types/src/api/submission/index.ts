import { z } from "zod";
import { codeSubmissionParamsSchema } from "../../core/submission/config/code-submission-params.js";
import { submissionEntitySchema } from "../../core/submission/schema/submission-entity.schema.js";
import { submissionDtoSchema } from "../../core/submission/schema/submission-dto.schema.js";
import { objectIdSchema } from "../../core/common/schema/object-id.js";
import { paginatedQuerySchema } from "../../core/common/schema/paginated-query.schema.js";
import { paginatedQueryResponseSchema } from "../../core/common/schema/paginated-query-response.schema.js";

// POST /submission - Submit code for a puzzle
export const createSubmissionRequestSchema = codeSubmissionParamsSchema;
export const createSubmissionSuccessResponseSchema = submissionEntitySchema;

// GET /submission/:id - Get a specific submission
export const getSubmissionRequestSchema = z.object({
	id: objectIdSchema,
});
export const getSubmissionSuccessResponseSchema = submissionDtoSchema;

// GET /submission - List submissions with pagination
export const listSubmissionsRequestSchema = paginatedQuerySchema.extend({
	userId: objectIdSchema.optional(),
	puzzleId: objectIdSchema.optional(),
	language: z.string().optional(),
});
export const listSubmissionsSuccessResponseSchema =
	paginatedQueryResponseSchema.extend({
		data: z.array(submissionDtoSchema),
	});

// POST /submission/game - Submit code in a game context
export const gameSubmissionRequestSchema = z.object({
	gameId: objectIdSchema,
	code: z.string(),
	language: z.string(),
});
export const gameSubmissionSuccessResponseSchema = z.object({
	message: z.string(),
	result: z.string(), // Pass/Fail result
});

// POST /submission/game - Link existing submission to game
export const linkSubmissionToGameRequestSchema = z.object({
	gameId: objectIdSchema,
	submissionId: objectIdSchema,
	userId: objectIdSchema,
});
export const linkSubmissionToGameSuccessResponseSchema = z.object({
	message: z.string(),
	gameId: z.string(),
	submissionId: z.string(),
});

// Common error response for submission endpoints
export const submissionErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

// Types
export type CreateSubmissionRequest = z.infer<
	typeof createSubmissionRequestSchema
>;
export type CreateSubmissionSuccessResponse = z.infer<
	typeof createSubmissionSuccessResponseSchema
>;

export type GetSubmissionRequest = z.infer<typeof getSubmissionRequestSchema>;
export type GetSubmissionSuccessResponse = z.infer<
	typeof getSubmissionSuccessResponseSchema
>;

export type ListSubmissionsRequest = z.infer<
	typeof listSubmissionsRequestSchema
>;
export type ListSubmissionsSuccessResponse = z.infer<
	typeof listSubmissionsSuccessResponseSchema
>;

export type GameSubmissionRequest = z.infer<typeof gameSubmissionRequestSchema>;
export type GameSubmissionSuccessResponse = z.infer<
	typeof gameSubmissionSuccessResponseSchema
>;

export type LinkSubmissionToGameRequest = z.infer<
	typeof linkSubmissionToGameRequestSchema
>;
export type LinkSubmissionToGameSuccessResponse = z.infer<
	typeof linkSubmissionToGameSuccessResponseSchema
>;

export type SubmissionErrorResponse = z.infer<
	typeof submissionErrorResponseSchema
>;
