export const apiUrls = {
	ACCOUNT_PREFERENCES: "/api/account/preferences",
	COMMENT_BY_ID: "/api/comment/:id",
	COMMENT_BY_ID_COMMENT: "/api/comment/:id/comment",
	COMMENT_BY_ID_VOTE: "/api/comment/:id/vote",
	EXECUTE_CODE: "/api/execute-code",
	PUZZLE_BY_ID_COMMENT: "/api/puzzles/:id/comment",
	SUBMISSION_BY_ID: "/api/submission/:id",
	SUBMIT_CODE: "/api/submit-code",
	SUBMIT_GAME: "/api/submit-game",
	SUPPORTED_LANGUAGES: "/api/supported-languages",
	USERNAME_IS_AVAILABLE: "/api/username-is-available/:username",
	USER_BY_USERNAME: "/api/user/:username",
	USER_BY_USERNAME_PUZZLE: "/api/user/:username/puzzle",
	VERIFY_TOKEN: "/api/verify-token"
} as const;
export type ApiUrl = (typeof apiUrls)[keyof typeof apiUrls];

interface Params {
	[key: string]: string | number;
}

/**
 * Builds an api url,
 * with the path added to it,
 * and params switched out,
 * e.g.: buildApiUrl("users/:id", { id: 5 }), results in apiUrl/users/5
 *
 * @param path
 * @param params
 * @returns the desired url
 */
export function buildApiUrl(path: ApiUrl, params: Params = {}) {
	let url: string = `${path}`;

	if (params) {
		// Replace placeholders in the path with actual values
		Object.entries(params).forEach(([key, value]) => {
			url = url.replace(`:${key}`, String(value));
		});
	}

	return url;
}
