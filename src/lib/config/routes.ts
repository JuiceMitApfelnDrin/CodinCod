export const urls = {
	root: "/",

	// account activity related
	sign_out: "/sign-out",
	sign_up: "/sign-up",
	sign_in: "/sign-in",

	// puzzles
	puzzles: "/puzzles",
	puzzle_by_id: "/puzzles/:id",
	puzzle_create: "/puzzles/create",
	puzzle_by_id_edit: "/puzzles/:id/edit",

	// personal account settings
	settings: "/settings",

	// user profile
	user_profile: "/profile",
	user_profile_by_id: "/profile/:id",

	// play game
	play: "/",

	// learn
	learn: "/learn",

	// community
	forum: "/forum",
	friends: "/friends",
	players: "/players",
	blog: "/blog"
};

interface Params {
	[key: string]: string | number;
}

export function buildLocalUrl(path: string, params: Params = {}) {
	let url = `${path}`;

	// Replace placeholders in the path with actual values
	Object.entries(params).forEach(([key, value]) => {
		url = url.replace(`:${key}`, String(value));
	});

	return url;
}
