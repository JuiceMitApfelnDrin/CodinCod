import { browser } from "$app/environment";
import type { AuthenticatedInfo } from "$lib/types/core/authentication/schema/authenticated-info.schema.js";
import { logger } from "$lib/utils/debug-logger";
import { derived, writable } from "svelte/store";

/**
 * Store for authenticated user information
 * Contains user ID, username, role, and authentication status
 */
export const authenticatedUserInfo = writable<AuthenticatedInfo | null>(null);

/**
 * Derived store that returns true if user is authenticated
 */
export const isAuthenticated = derived(authenticatedUserInfo, (userInfo) => {
	const authenticated = userInfo?.isAuthenticated ?? false;

	logger.store("isAuthenticated derived update", {
		authenticated,
		userInfo: userInfo
			? {
					userId: userInfo.userId,
					username: userInfo.username,
					isAuthenticated: userInfo.isAuthenticated
				}
			: null
	});

	return authenticated;
});

/**
 * Update authenticated user information
 */
export function setAuthenticatedUser(userInfo: AuthenticatedInfo | null) {
	authenticatedUserInfo.set(userInfo);
}

/**
 * Clear authenticated user information (logout)
 */
export function clearAuthenticatedUser() {
	authenticatedUserInfo.set(null);
}

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string) =>
	derived(authenticatedUserInfo, (userInfo) => userInfo?.role === role);

/**
 * Get current user ID
 */
export const currentUserId = derived(
	authenticatedUserInfo,
	(userInfo) => userInfo?.userId
);

/**
 * Get current username
 */
export const currentUsername = derived(
	authenticatedUserInfo,
	(userInfo) => userInfo?.username
);

// Debug logging in development
if (browser) {
	authenticatedUserInfo.subscribe((value) => {
		logger.store("authenticatedUserInfo changed", {
			isAuthenticated: value?.isAuthenticated ?? false,
			userId: value?.userId,
			username: value?.username,
			role: value?.role,
			fullValue: value
		});
	});
}
