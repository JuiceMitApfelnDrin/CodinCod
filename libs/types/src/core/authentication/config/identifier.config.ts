import { EMAIL_CONFIG } from "./email.config.js";
import { USERNAME_CONFIG } from "./username.config.js";

export const IDENTIFIER_CONFIG = {
	maxIdentifierLength: Math.max(
		EMAIL_CONFIG.maxEmailLength,
		USERNAME_CONFIG.maxUsernameLength,
	),
	minIdentifierLength: Math.min(
		EMAIL_CONFIG.minEmailLength,
		USERNAME_CONFIG.minUsernameLength,
	),
} as const;
