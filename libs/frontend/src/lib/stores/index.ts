import { browser } from "$app/environment";
import { localStorageKeys } from "@/config/local-storage";
import { isThemeOption, themeOptions, type ThemeOption } from "@/config/theme-option";
import { derived, writable } from "svelte/store";
import { isAuthenticatedInfo, type AuthenticatedInfo } from "types";

/**
 * start dark-theme store
 */

const theme = writable<ThemeOption>();
export const isDarkTheme = derived(theme, (currentTheme) => currentTheme === themeOptions.DARK);
export const toggleDarkTheme = () =>
	theme.update((oldValue) =>
		oldValue === themeOptions.DARK ? themeOptions.LIGHT : themeOptions.DARK
	);

if (browser) {
	const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const storedTheme = localStorage.getItem(localStorageKeys.THEME);
	const preferredTheme = prefersDarkTheme ? themeOptions.DARK : themeOptions.LIGHT;
	const themeOption = isThemeOption(storedTheme) ? storedTheme : preferredTheme;
	theme.set(themeOption);

	theme.subscribe((newTheme) => {
		if (newTheme === themeOptions.DARK) {
			document.documentElement.classList.add(themeOptions.DARK);
		} else {
			document.documentElement.classList.remove(themeOptions.DARK);
		}
		localStorage.setItem(localStorageKeys.THEME, newTheme);
	});
}

/**
 * end dark-theme store
 */

/**
 * start user-info store
 */

export const authenticatedUserInfo = writable<AuthenticatedInfo | null>(null);

export const isAuthenticated = derived(authenticatedUserInfo, (userInfo) => {
	return userInfo?.isAuthenticated ?? false;
});

// Load user info from local storage (if any)
if (browser) {
	const storedUserInfo = localStorage.getItem(localStorageKeys.AUTHENTICATED_USER_INFO);

	if (storedUserInfo) {
		const parsedUserInfo = JSON.parse(storedUserInfo);

		if (parsedUserInfo.isAuthenticated && isAuthenticatedInfo(parsedUserInfo)) {
			authenticatedUserInfo.set(parsedUserInfo);
		}
	}

	// Update local storage whenever user info changes
	authenticatedUserInfo.subscribe(($userInfo) => {
		if ($userInfo) {
			localStorage.setItem(localStorageKeys.AUTHENTICATED_USER_INFO, JSON.stringify($userInfo));
		} else {
			localStorage.removeItem(localStorageKeys.AUTHENTICATED_USER_INFO);
		}
	});
}

/**
 * end user-info store
 */
