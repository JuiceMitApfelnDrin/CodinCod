import { z } from "zod";
import { USERNAME_CONFIG } from "../../authentication/config/username-config.js";
import { PASSWORD_CONFIG } from "../../authentication/config/password-config.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { userProfileSchema } from "./user-profile.schema.js";
import { DEFAULT_USER_ROLE, userRoleSchema } from "../enum/user-role.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const usernameSchema = z
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
	);

export const userEntitySchema = z.object({
	username: usernameSchema,
	password: z
		.string()
		.min(
			PASSWORD_CONFIG.minPasswordLength,
			`Password must be at least ${PASSWORD_CONFIG.minPasswordLength} characters long`,
		),
	email: z.email("Invalid email address"),
	profile: userProfileSchema.optional(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	role: userRoleSchema.prefault(DEFAULT_USER_ROLE).optional(),
	reportCount: z.number().int().min(0).default(0).optional(),
	banCount: z.number().int().min(0).default(0).optional(),
	currentBan: objectIdSchema.optional(),
});
export type UserEntity = z.infer<typeof userEntitySchema>;
