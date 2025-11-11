export const USERNAME_CONFIG = {
	minUsernameLength: 3,
	maxUsernameLength: 20,
	// Regex for validation - hyphen at end of character class to avoid ambiguity
	allowedCharacters: /^[a-zA-Z0-9_-]+$/,
	// Pattern for HTML input (string version without anchors)
	allowedCharactersPattern: "[a-zA-Z0-9_\\-]+",
} as const;
