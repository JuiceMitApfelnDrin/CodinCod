import { BACKEND_URL } from "$env/static/private";

const login = "login";
const register = "register";
const puzzles = "puzzles";
const puzzle_by_id = "puzzles/:id";
const profile = "profile";
const users = "users";
const user_by_id = "users/:id";
const account = "account";

export const backend_routes = {
	login,
	register,
	puzzle_by_id,
	puzzles,
	profile,
	users,
	user_by_id,
	account
};

interface Params {
	[key: string]: string | number;
}

export function buildBackendUrl(path: string, params: Params = {}) {
	let url = `${BACKEND_URL}/${path}`;

	// Replace placeholders in the path with actual values
	Object.entries(params).forEach(([key, value]) => {
		url = url.replace(`:${key}`, String(value));
	});

	return url;
}
