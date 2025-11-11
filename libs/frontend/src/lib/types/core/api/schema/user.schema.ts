import { z } from "zod";
import { paginatedQueryResponseSchema } from "../../common/schema/paginated-query-response.schema.js";
import { paginatedQuerySchema } from "../../common/schema/paginated-query.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { userActivitySchema } from "../../user/schema/user-activity.schema.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";

// GET /user/:username response
export const getUserByUsernameResponseSchema = userDtoSchema;
export type GetUserByUsernameResponse = z.infer<
	typeof getUserByUsernameResponseSchema
>;

// GET /user/:username/puzzle query
export const getUserPuzzlesQuerySchema = paginatedQuerySchema;
export type GetUserPuzzlesQuery = z.infer<typeof getUserPuzzlesQuerySchema>;

// GET /user/:username/puzzle response
export const getUserPuzzlesResponseSchema = paginatedQueryResponseSchema.extend(
	{
		items: z.array(puzzleDtoSchema)
	}
);
export type GetUserPuzzlesResponse = z.infer<
	typeof getUserPuzzlesResponseSchema
>;

// GET /user/:username/activity response
export const getUserActivityResponseSchema = z.array(userActivitySchema);
export type GetUserActivityResponse = z.infer<
	typeof getUserActivityResponseSchema
>;

// GET /user/:username/isAvailable response
export const usernameIsAvailableResponseSchema = z.object({
	available: z.boolean()
});
export type UsernameIsAvailableResponse = z.infer<
	typeof usernameIsAvailableResponseSchema
>;
