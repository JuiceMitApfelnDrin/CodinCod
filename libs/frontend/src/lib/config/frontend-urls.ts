/**
 * Frontend URL configuration
 * Centralizes all frontend route paths
 */

export const frontendUrls = {
	HOME: "/",
	LOGIN: "/login",
	REGISTER: "/register",
	LOGOUT: "/logout",
	FORGOT_PASSWORD: "/forgot-password",
	RESET_PASSWORD: "/reset-password",
	
	// Puzzles
	PUZZLES: "/puzzles",
	PUZZLE_CREATE: "/puzzles/create",
	PUZZLE_DETAIL: (id: string) => `/puzzles/${id}`,
	PUZZLE_EDIT: (id: string) => `/puzzles/${id}/edit`,
	PUZZLE_PLAY: (id: string) => `/puzzles/${id}/play`,
	
	// Multiplayer
	MULTIPLAYER: "/multiplayer",
	MULTIPLAYER_GAME: (id: string) => `/multiplayer/${id}`,
	
	// Profile
	PROFILE: (username: string) => `/profile/${username}`,
	PROFILE_PUZZLES: (username: string) => `/profile/${username}/puzzles`,
	
	// Settings
	SETTINGS: "/settings",
	SETTINGS_PROFILE: "/settings/profile",
	SETTINGS_ACCOUNT: "/settings/account",
	SETTINGS_APPEARANCE: "/settings/appearance",
	SETTINGS_PREFERENCES: "/settings/preferences",
	SETTINGS_COMMUNITY: "/settings/community",
	SETTINGS_NOTIFICATIONS: "/settings/notifications",
	
	// Other
	LEADERBOARDS: "/leaderboards",
	LEARN: "/learn",
	DOCS: "/docs",
	MODERATION: "/moderation",
	MAINTENANCE: "/maintenance"
} as const;

export type FrontendUrl = typeof frontendUrls;
