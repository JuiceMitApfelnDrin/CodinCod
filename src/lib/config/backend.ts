const login = "login";
const register = "register";
const puzzle = "puzzle";
const puzzle_by_id = "puzzles/:id";
const profile = "profile";
const users = "users";
const user_by_id = "users/:id";
const account = "account";

/**
 * TODO: remove this eventually with the values from types
 */
export const backend_routes = {
	login,
	register,
	puzzle_by_id,
	puzzle,
	profile,
	users,
	user_by_id,
	account
};

interface Params {
	[key: string]: string | number;
}

/**
 * Builds a backend url,
 * with the path added to it,
 * and params switched out,
 * e.g.: buildBackendUrl("users/:id", { id: 5 }), results in backendUrl/users/5
 *
 * @param path
 * @param params
 * @returns the desired url
 */
export function buildBackendUrl(path: string, params: Params = {}) {
	let url = `${import.meta.env.VITE_BACKEND_URL}${path}`;

	if (params) {
		// Replace placeholders in the path with actual values
		Object.entries(params).forEach(([key, value]) => {
			url = url.replace(`:${key}`, String(value));
		});
	}

	return url;
}
