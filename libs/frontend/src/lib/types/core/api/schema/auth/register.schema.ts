import { z } from "zod";
import { messageSchema } from "../../../common/schema/message.schema.js";
import { USERNAME_CONFIG } from "../../../authentication/config/username-config.js";
import { PASSWORD_CONFIG } from "../../../authentication/config/password-config.js";

export const registerRequestSchema = z.object({
	username: z
		.string()
		.min(
			USERNAME_CONFIG.minUsernameLength,
			`Username must be at least ${USERNAME_CONFIG.minUsernameLength} characters`,
		)
		.max(
			USERNAME_CONFIG.maxUsernameLength,
			`Username cannot exceed ${USERNAME_CONFIG.maxUsernameLength} characters`,
		)
		.regex(
			USERNAME_CONFIG.allowedCharacters,
			"Username can only contain letters, numbers, underscores, and hyphens",
		),
	email: z.string().email("Invalid email address").optional(),
	password: z
		.string()
		.min(
			PASSWORD_CONFIG.minPasswordLength,
			`Password must be at least ${PASSWORD_CONFIG.minPasswordLength} characters`,
		),
});

export const registerResponseSchema = messageSchema;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
