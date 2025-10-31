import { z } from "zod";
import { userDtoSchema } from "../../../user/schema/user-dto.schema.js";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";

/**
 * GET /user/me - Get current user information
 */
export const getCurrentUserResponseSchema =
	userDtoSchema.or(errorResponseSchema);

export type GetCurrentUserResponse = z.infer<
	typeof getCurrentUserResponseSchema
>;
