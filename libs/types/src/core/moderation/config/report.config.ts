export const REPORT_CONFIG = {
	minLengthExplanation: "this user is using cheats".length,
	maxLengthExplanation: 1024,
	allowedCharacters: /^[a-zA-Z0-9_-]+$/g,
} as const;
