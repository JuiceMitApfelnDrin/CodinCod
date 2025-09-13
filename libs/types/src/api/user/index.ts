import { z } from "zod";
import { userDtoSchema } from "../../core/user/schema/user-dto.schema.js";
import { userEntitySchema } from "../../core/user/schema/user-entity.schema.js";
import { paginatedQuerySchema } from "../../core/common/schema/paginated-query.schema.js";
import { paginatedQueryResponseSchema } from "../../core/common/schema/paginated-query-response.schema.js";
import { objectIdSchema } from "../../core/common/schema/object-id.js";

// GET /user - List users
export const listUsersRequestSchema = paginatedQuerySchema.extend({
	search: z.string().optional(),
});
export const listUsersSuccessResponseSchema =
	paginatedQueryResponseSchema.extend({
		data: z.array(userDtoSchema),
	});

// GET /user/:username - Get user profile
export const getUserRequestSchema = z.object({
	username: z.string(),
});
export const getUserSuccessResponseSchema = userDtoSchema;

// GET /user/:username/isAvailable - Check username availability
export const checkUsernameAvailabilityRequestSchema = z.object({
	username: z.string(),
});
export const checkUsernameAvailabilitySuccessResponseSchema = z.object({
	available: z.boolean(),
	message: z.string(),
});

// GET /user/:username/puzzle - Get user's puzzles
export const getUserPuzzlesRequestSchema = z
	.object({
		username: z.string(),
	})
	.extend(paginatedQuerySchema.shape);
export const getUserPuzzlesSuccessResponseSchema =
	paginatedQueryResponseSchema.extend({
		data: z.array(
			z.object({
				// Simplified puzzle data for user context
				id: objectIdSchema,
				title: z.string(),
				difficulty: z.string(),
				createdAt: z.string(),
				visibility: z.string(),
			}),
		),
	});

// GET /user/:username/activity - Get user's activity
export const getUserActivityRequestSchema = z
	.object({
		username: z.string(),
	})
	.extend(paginatedQuerySchema.shape);
export const getUserActivitySuccessResponseSchema = z.object({
	data: z.record(
		z.string(),
		z.array(
			z.object({
				type: z.string(),
				timestamp: z.string(),
				details: z.record(z.string(), z.any()).optional(),
			}),
		),
	),
});

// PUT /user/:username - Update user profile (authenticated user only)
export const updateUserRequestSchema = z.object({
	username: z.string(),
	data: userEntitySchema.partial().pick({
		email: true,
		profile: true,
	}),
});
export const updateUserSuccessResponseSchema = userDtoSchema;

// Common error response for user endpoints
export const userErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

// Types
export type ListUsersRequest = z.infer<typeof listUsersRequestSchema>;
export type ListUsersSuccessResponse = z.infer<
	typeof listUsersSuccessResponseSchema
>;

export type GetUserRequest = z.infer<typeof getUserRequestSchema>;
export type GetUserSuccessResponse = z.infer<
	typeof getUserSuccessResponseSchema
>;

export type CheckUsernameAvailabilityRequest = z.infer<
	typeof checkUsernameAvailabilityRequestSchema
>;
export type CheckUsernameAvailabilitySuccessResponse = z.infer<
	typeof checkUsernameAvailabilitySuccessResponseSchema
>;

export type GetUserPuzzlesRequest = z.infer<typeof getUserPuzzlesRequestSchema>;
export type GetUserPuzzlesSuccessResponse = z.infer<
	typeof getUserPuzzlesSuccessResponseSchema
>;

export type GetUserActivityRequest = z.infer<
	typeof getUserActivityRequestSchema
>;
export type GetUserActivitySuccessResponse = z.infer<
	typeof getUserActivitySuccessResponseSchema
>;

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type UpdateUserSuccessResponse = z.infer<
	typeof updateUserSuccessResponseSchema
>;

export type UserErrorResponse = z.infer<typeof userErrorResponseSchema>;
