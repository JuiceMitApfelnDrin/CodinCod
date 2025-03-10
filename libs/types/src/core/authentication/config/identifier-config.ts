import { USERNAME_CONFIG } from "./username-config.js";

export const IDENTIFIER_CONFIG = {
	maxIdentifierLength: 254,
	minIdentifierLength: USERNAME_CONFIG.minUsernameLength
} as const;
