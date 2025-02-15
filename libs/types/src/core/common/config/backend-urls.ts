export const baseRoute = "/api/v1";

export const backendUrls = {
	ROOT: "/",
	REGISTER: `${baseRoute}/register`,
	LOGIN: `${baseRoute}/login`,
	USER: `${baseRoute}/user`,
	USER_BY_USERNAME: `${baseRoute}/user/:username`,
	USER_BY_USERNAME_ACTIVITY: `${baseRoute}/user/:username/activity`,
	USER_BY_USERNAME_IS_AVAILABLE: `${baseRoute}/user/:username/isAvailable`,
	ACCOUNT: `${baseRoute}/account`,
	ACCOUNT_PREFERENCES: `${baseRoute}/account/preferences`,
	EXECUTE: `${baseRoute}/execute`,

	// puzzle routes
	PUZZLE: `${baseRoute}/puzzle`,
	PUZZLE_DETAIL: `${baseRoute}/puzzle/:id`,
	PUZZLE_LANGUAGES: `${baseRoute}/puzzle/languages`,

	HEALTH: `${baseRoute}/health`,
	VALIDATOR: `${baseRoute}/validator`,
	SUBMISSION: `${baseRoute}/submission`,
	SUBMISSION_BY_ID: `${baseRoute}/submission/:id`,
	SUBMISSION_GAME: `${baseRoute}/submission/game`,
	REPORT: `${baseRoute}/report`
} as const;

export type BackendUrl = (typeof backendUrls)[keyof typeof backendUrls];
