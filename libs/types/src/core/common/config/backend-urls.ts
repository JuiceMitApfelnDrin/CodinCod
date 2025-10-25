export const baseRoute = "/api/v1";

export const backendUrls = {
	ROOT: "/",
	REGISTER: `${baseRoute}/register`,
	LOGIN: `${baseRoute}/login`,
	USER_ME: `${baseRoute}/user/me`,
	USER: `${baseRoute}/user`,
	userByUsername: (username: string) => `${baseRoute}/user/${username}`,
	userByUsernamePuzzle: (username: string) =>
		`${baseRoute}/user/${username}/puzzle`,
	userByUsernameActivity: (username: string) =>
		`${baseRoute}/user/${username}/activity`,
	userByUsernameIsAvailable: (username: string) =>
		`${baseRoute}/user/${username}/isAvailable`,
	ACCOUNT: `${baseRoute}/account`,
	ACCOUNT_PREFERENCES: `${baseRoute}/account/preferences`,
	EXECUTE: `${baseRoute}/execute`,

	// puzzle routes
	PUZZLE: `${baseRoute}/puzzle`,
	puzzleById: (id: string) => `${baseRoute}/puzzle/${id}`,
	puzzleByIdComment: (id: string) => `${baseRoute}/puzzle/${id}/comment`,
	puzzleByIdSolution: (id: string) => `${baseRoute}/puzzle/${id}/solution`,
	PUZZLE_LANGUAGES: `${baseRoute}/puzzle/languages`,

	// comment
	COMMENT: `${baseRoute}/comment`,
	commentById: (id: string) => `${baseRoute}/comment/${id}`,
	commentByIdComment: (id: string) => `${baseRoute}/comment/${id}/comment`,
	commentByIdVote: (id: string) => `${baseRoute}/comment/${id}/vote`,

	HEALTH: `${baseRoute}/health`,
	VALIDATOR: `${baseRoute}/validator`,
	SUBMISSION: `${baseRoute}/submission`,
	submissionById: (id: string) => `${baseRoute}/submission/${id}`,
	SUBMISSION_GAME: `${baseRoute}/submission/game`,
	REPORT: `${baseRoute}/report`,
} as const;

export const backendParams = {
	USERNAME: ":username",
	ID: ":id",
} as const;
