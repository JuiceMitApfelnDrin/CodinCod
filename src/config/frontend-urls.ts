export const frontendUrls = {
	ROOT: "/",

	// account activity related
	SIGN_OUT: "/sign-out",
	SIGN_UP: "/sign-up",
	SIGN_IN: "/sign-in",

	// puzzles
	PUZZLES: "/puzzles",
	PUZZLE_BY_ID: "/puzzles/:id",
	PUZZLE_CREATE: "/puzzles/create",
	PUZZLE_BY_ID_EDIT: "/puzzles/:id/edit",
	PUZZLE_BY_ID_PLAY: "/puzzles/:id/play",

	// personal account settings
	SETTINGS: "/settings",

	// user profile
	USER_PROFILE: "/profile",
	USER_PROFILE_BY_ID: "/profile/:id",

	// play game
	PLAY: "/",

	// learn
	LEARN: "/learn",

	// community
	FORUM: "/forum",
	FRIENDS: "/friends",
	PLAYERS: "/players",
	BLOG: "/blog"
} as const;
