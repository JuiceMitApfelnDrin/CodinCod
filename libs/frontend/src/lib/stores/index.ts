import { browser } from "$app/environment";
import { localStorageKeys } from "@/config/local-storage";
import { derived, writable } from "svelte/store";
import { isThemeOption, themeOption, type AuthenticatedInfo, type ThemeOption } from "types";
import { preferences } from "./preferences";

/**
 * start dark-theme store
 */

const theme = writable<ThemeOption>();
export const isDarkTheme = derived(theme, (currentTheme) => currentTheme === themeOption.DARK);
export const toggleDarkTheme = () =>
	theme.update((oldValue) => {
		const newTheme = oldValue === themeOption.DARK ? themeOption.LIGHT : themeOption.DARK;

		// Update backend
		preferences.updatePreferences({ theme: newTheme });

		return newTheme;
	});

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

/**
 * end user-info store
 */

/**
 * start integrate preferences store
 */

if (browser) {
	authenticatedUserInfo.subscribe((user) => {
		if (user?.isAuthenticated) {
			preferences.loadPreferences();
		}
	});

	preferences.subscribe((newPreferences) => {
		if (newPreferences) {
			localStorage.setItem(localStorageKeys.PREFERENCES, JSON.stringify(newPreferences));
		}

		if (newPreferences?.theme) {
			theme.set(newPreferences.theme);
		}
	});
}

/**
 * end integrate preferences store
 */
