export const baseRoute = "/api/v1";

export const backendUrls = {
	ROOT: "/",
	REGISTER: `${baseRoute}/register`,
	LOGIN: `${baseRoute}/login`,
	USER: `${baseRoute}/user`,
	ACCOUNT: `${baseRoute}/account`,

	// puzzle routes
	PUZZLE: `${baseRoute}/puzzle`,
	PUZZLE_DETAIL: `${baseRoute}/puzzle/:id`,

	HEALTH: `${baseRoute}/health`,
	VALIDATOR: `${baseRoute}/validator`,
	SUBMISSION: `${baseRoute}/submission`,
	REPORT: `${baseRoute}/report`
} as const;
