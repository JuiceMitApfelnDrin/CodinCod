import { browser } from "$app/environment";
import { localStorageKeys } from "@/config/local-storage";
import { derived, writable } from "svelte/store";
import {
	isAuthenticatedInfo,
	isThemeOption,
	themeOption,
	type AuthenticatedInfo,
	type ThemeOption
} from "types";

/**
 * start dark-theme store
 */

const theme = writable<ThemeOption>();
export const isDarkTheme = derived(theme, (currentTheme) => currentTheme === themeOption.DARK);
export const toggleDarkTheme = () =>
	theme.update((oldValue) =>
		oldValue === themeOption.DARK ? themeOption.LIGHT : themeOption.DARK
	);

if (browser) {
	const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const storedTheme = localStorage.getItem(localStorageKeys.THEME);
	const preferredTheme = prefersDarkTheme ? themeOption.DARK : themeOption.LIGHT;
	const currentThemeOption = isThemeOption(storedTheme) ? storedTheme : preferredTheme;
	theme.set(currentThemeOption);

	theme.subscribe((newTheme) => {
		if (newTheme === themeOption.DARK) {
			document.documentElement.classList.add(themeOption.DARK);
		} else {
			document.documentElement.classList.remove(themeOption.DARK);
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
