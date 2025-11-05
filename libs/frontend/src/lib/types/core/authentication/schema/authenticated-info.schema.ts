import { z } from "zod";
import { userEntitySchema } from "../../user/schema/user-entity.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const authenticatedInfoSchema = z.object({
	userId: objectIdSchema,
	username: userEntitySchema.shape.username,
	role: userEntitySchema.shape.role,
	isAuthenticated: z.boolean(),
});
export type AuthenticatedInfo = z.infer<typeof authenticatedInfoSchema>;

export function isAuthenticatedInfo(
	supposedUser: unknown,
): supposedUser is AuthenticatedInfo {
	return authenticatedInfoSchema.safeParse(supposedUser).success;
}
