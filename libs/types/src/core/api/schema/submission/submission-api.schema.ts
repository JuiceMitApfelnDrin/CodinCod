import { z } from "zod";
import { objectIdSchema } from "../../../common/schema/object-id.js";
import { submissionEntitySchema } from "../../../submission/schema/submission-entity.schema.js";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { PAGINATION_CONFIG } from "../../../common/config/pagination.js";

/**
 * POST /submission - Submit code for evaluation
 * This replaces the generic DTO approach with specific types
 */
export const submitCodeRequestSchema = z.object({
	puzzleId: objectIdSchema,
	programmingLanguageId: objectIdSchema,
	code: z.string().min(1, "Code cannot be empty"),
	userId: objectIdSchema, // Should come from authenticated session
});

export const submitCodeResponseSchema = z
	.object({
		// Specific fields returned on submission
		submissionId: z.string(),
		code: z.string(),
		puzzleId: z.string(),
		programmingLanguageId: z.string(),
		userId: z.string(),
		codeLength: z.number().int().positive(),
		result: z.object({
			successRate: z.number().min(0).max(1),
			passed: z.number().int().nonnegative(),
			failed: z.number().int().nonnegative(),
			total: z.number().int().positive(),
		}),
		createdAt: z.date().or(z.string()),
	})
	.or(errorResponseSchema);

export type SubmitCodeRequest = z.infer<typeof submitCodeRequestSchema>;
export type SubmitCodeResponse = z.infer<typeof submitCodeResponseSchema>;

/**
 * GET /submission/:id - Get submission by ID
 */
export const getSubmissionByIdRequestSchema = z.object({
	id: objectIdSchema,
});

export const getSubmissionByIdResponseSchema =
	submissionEntitySchema.or(errorResponseSchema);

export type GetSubmissionByIdRequest = z.infer<
	typeof getSubmissionByIdRequestSchema
>;
export type GetSubmissionByIdResponse = z.infer<
	typeof getSubmissionByIdResponseSchema
>;

/**
 * GET /submission - List user submissions
 */
export const listSubmissionsRequestSchema = z.object({
	userId: objectIdSchema.optional(),
	puzzleId: objectIdSchema.optional(),
	page: z.number().int().positive().default(PAGINATION_CONFIG.DEFAULT_PAGE),
	pageSize: z.number().int().positive().max(PAGINATION_CONFIG.MAX_LIMIT).default(PAGINATION_CONFIG.DEFAULT_LIMIT),
});

export const listSubmissionsResponseSchema = z
	.object({
		items: z.array(submissionEntitySchema),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
		totalPages: z.number().int().nonnegative(),
		totalItems: z.number().int().nonnegative(),
	})
	.or(errorResponseSchema);

export type ListSubmissionsRequest = z.infer<
	typeof listSubmissionsRequestSchema
>;
export type ListSubmissionsResponse = z.infer<
	typeof listSubmissionsResponseSchema
>;

/**
 * POST /submission/game - Submit an existing submission to a game
 */
export const submitToGameRequestSchema = z.object({
	gameId: objectIdSchema,
	submissionId: objectIdSchema,
	userId: objectIdSchema,
});

export const submitToGameResponseSchema = z
	.object({
		success: z.boolean(),
		message: z.string(),
		game: z
			.object({
				id: objectIdSchema,
				status: z.enum(["waiting", "in_progress", "completed"]),
				playerCount: z.number().int().nonnegative(),
			})
			.optional(),
		leaderboardPosition: z.number().int().positive().optional(),
	})
	.or(errorResponseSchema);

export type SubmitToGameRequest = z.infer<typeof submitToGameRequestSchema>;
export type SubmitToGameResponse = z.infer<typeof submitToGameResponseSchema>;
