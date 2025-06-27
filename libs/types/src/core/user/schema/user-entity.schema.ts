import z from "zod";
import { USERNAME_CONFIG } from "../../authentication/config/username-config.js";
import { PASSWORD_CONFIG } from "../../authentication/config/password-config.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { userProfileSchema } from "./user-profile.schema.js";
import { DEFAULT_USER_ROLES, userRoleSchema } from "../enum/user-role.js";

export const userEntitySchema = z.object({
	username: z
		.string()
		.min(
			USERNAME_CONFIG.minUsernameLength,
			`Username must be at least ${USERNAME_CONFIG.minUsernameLength} characters long`,
		)
		.max(
			USERNAME_CONFIG.maxUsernameLength,
			`Username must be at most ${USERNAME_CONFIG.maxUsernameLength} characters long`,
		)
		.regex(
			USERNAME_CONFIG.allowedCharacters,
			"Username can only contain letters, numbers, hyphens, and underscores",
		),
	password: z
		.string()
		.min(
			PASSWORD_CONFIG.minPasswordLength,
			`Password must be at least ${PASSWORD_CONFIG.minPasswordLength} characters long`,
		),
	email: z.string().email("Invalid email address"),
	profile: userProfileSchema.optional(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	roles: z.array(userRoleSchema).default(DEFAULT_USER_ROLES)
});
export type UserEntity = z.infer<typeof userEntitySchema>;
