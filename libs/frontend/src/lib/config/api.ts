export const apiUrls = {
	EXECUTE_CODE: "/api/execute-code",
	SUBMIT_CODE: "/api/submit-code",
	SUBMIT_GAME: "/api/submit-game",
	USERNAME_IS_AVAILABLE: "/api/username-is-available/:username",
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
