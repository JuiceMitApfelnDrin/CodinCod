import { z } from "zod";
import { userEntitySchema } from "../../user/index.js";

export const authenticatedInfoSchema = z.object({
	userId: z.string(),
	username: userEntitySchema.shape.username,
	isAuthenticated: z.boolean()
});
export type AuthenticatedInfo = z.infer<typeof authenticatedInfoSchema>;

export function isAuthenticatedInfo(supposedUser: unknown): supposedUser is AuthenticatedInfo {
	return authenticatedInfoSchema.safeParse(supposedUser).success;
}
