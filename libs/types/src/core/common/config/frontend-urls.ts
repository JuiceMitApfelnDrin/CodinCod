export const frontendUrls = {
	ROOT: "/",

	// account activity related
	// SIGN_OUT: "/sign-out",
	// SIGN_UP: "/sign-up",
	// SIGN_IN: "/sign-in",
	REGISTER: "/register",
	LOGIN: "/login",
	LOGOUT: "/logout",

	// puzzles
	PUZZLES: "/puzzles",
	puzzleById: (id: string) => `/puzzles/${id}`,
	PUZZLE_CREATE: "/puzzles/create",
	puzzleByIdEdit: (id: string) => `/puzzles/${id}/edit`,
	puzzleByIdPlay: (id: string) => `/puzzles/${id}/play`,

	// personal account settings
	SETTINGS: "/settings",
	SETTINGS_PROFILE: "/settings/profile",
	SETTINGS_ACCOUNT: "/settings/account",
	SETTINGS_APPEARANCE: "/settings/appearance",
	SETTINGS_PREFERENCES: "/settings/preferences",
	SETTINGS_COMMUNITY: "/settings/community",
	SETTINGS_NOTIFICATIONS: "/settings/notifications",

	// user profile
	USER_PROFILE: "/profile",
	userProfileByUsername: (username: string) => `/profile/${username}`,
	userProfileByUsernamePuzzles: (username: string) =>
		`/profile/${username}/puzzles`,

	// play game
	// PLAY: "/",
	// multiplayer
	MULTIPLAYER: "/multiplayer",
	multiplayerById: (id: string) => `/multiplayer/${id}`,

	// learn
	LEARN: "/learn",
	learnBySlug: (slug: string) => `/learn/${slug}`,
	LEARN_MARKDOWN: "/learn/markdown",

	// community
	FORUM: "/forum",
	FRIENDS: "/friends",
	PLAYERS: "/players",
	BLOG: "/blog",

	// docs
	DOCS: "/docs",
	DOCS_ACTIVITY: "/docs/activity",
} as const;

export type FrontendUrl = string;
