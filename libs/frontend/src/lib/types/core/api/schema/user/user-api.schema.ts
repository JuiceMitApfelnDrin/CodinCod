import { z } from "zod";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { userDtoSchema } from "../../../user/schema/user-dto.schema.js";
import { usernameSchema } from "../../../user/schema/user-entity.schema.js";

/**
 * GET /user/me - Get current user information
 */
export const getCurrentUserResponseSchema =
	userDtoSchema.or(errorResponseSchema);

export type GetCurrentUserResponse = z.infer<
	typeof getCurrentUserResponseSchema
>;

/**
 * GET /user/:username - Get user by username
 */
export const getUserByUsernameRequestSchema = z.object({
	username: usernameSchema
});

export const getUserByUsernameResponseSchema = z
	.object({
		message: z.string(),
		user: userDtoSchema
	})
	.or(errorResponseSchema);

export type GetUserByUsernameRequest = z.infer<
	typeof getUserByUsernameRequestSchema
>;
export type GetUserByUsernameResponse = z.infer<
	typeof getUserByUsernameResponseSchema
>;

/**
 * GET /user/:username/isAvailable - Check if username is available
 */
export const checkUsernameAvailabilityRequestSchema = z.object({
	username: usernameSchema
});

export const checkUsernameAvailabilityResponseSchema = z.object({
	available: z.boolean()
});

export type CheckUsernameAvailabilityRequest = z.infer<
	typeof checkUsernameAvailabilityRequestSchema
>;
export type CheckUsernameAvailabilityResponse = z.infer<
	typeof checkUsernameAvailabilityResponseSchema
>;
