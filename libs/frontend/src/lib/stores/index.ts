import { browser } from "$app/environment";
import { localStorageKeys } from "@/config/local-storage";
import { derived, writable } from "svelte/store";
import {
	isThemeOption,
	themeOption,
	type AuthenticatedInfo,
	type ThemeOption
} from "types";
import { preferences } from "./preferences";

/**
 * start dark-theme store
 */

const theme = writable<ThemeOption>();
export const isDarkTheme = derived(
	theme,
	(currentTheme) => currentTheme === themeOption.DARK
);
export const toggleDarkTheme = () =>
	theme.update((oldValue) =>
		oldValue === themeOption.DARK ? themeOption.LIGHT : themeOption.DARK
	);

if (browser) {
	const prefersDarkTheme = window.matchMedia(
		"(prefers-color-scheme: dark)"
	).matches;
	const storedTheme = localStorage.getItem(localStorageKeys.THEME);
	const preferredTheme = prefersDarkTheme
		? themeOption.DARK
		: themeOption.LIGHT;
	const currentThemeOption = isThemeOption(storedTheme)
		? storedTheme
		: preferredTheme;

	// Initialize the store without triggering subscription
	// The inline script in app.html already set the class
	theme.set(currentThemeOption);

	theme.subscribe((newTheme) => {
		// Only update DOM if the class doesn't match the desired state
		const isDarkClass = document.documentElement.classList.contains(
			themeOption.DARK
		);
		const shouldBeDark = newTheme === themeOption.DARK;

		if (shouldBeDark && !isDarkClass) {
			document.documentElement.classList.add(themeOption.DARK);
		} else if (!shouldBeDark && isDarkClass) {
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
	isAuthenticated.subscribe((isAuthenticated) => {
		if (isAuthenticated) {
			preferences.loadPreferences();
		}
	});

	preferences.subscribe((newPreferences) => {
		if (newPreferences) {
			localStorage.setItem(
				localStorageKeys.PREFERENCES,
				JSON.stringify(newPreferences)
			);
		}

		if (newPreferences?.theme) {
			theme.set(newPreferences.theme);
		}
	});

	derived([theme, isAuthenticated], ([theme, isAuthenticated]) => {
		return { isAuthenticated, theme };
	}).subscribe(({ isAuthenticated, theme }) => {
		if (isAuthenticated) {
			preferences.updatePreferences({ theme });
		}
	});
}

/**
 * end integrate preferences store
 */
