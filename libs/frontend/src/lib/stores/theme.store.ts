import { browser } from "$app/environment";
import {
	isThemeOption,
	themeOption,
	type ThemeOption
} from "$lib/types/core/preferences/enum/theme-option.js";
import { localStorageKeys } from "@/config/local-storage";
import { derived, writable } from "svelte/store";

/**
 * Store for the current theme (light/dark mode)
 */
export const theme = writable<ThemeOption>();

/**
 * Derived store that returns true if dark theme is active
 */
export const isDarkTheme = derived(
	theme,
	(currentTheme) => currentTheme === themeOption.DARK
);

/**
 * Toggle between light and dark theme
 */
export const toggleDarkTheme = () =>
	theme.update((oldValue) =>
		oldValue === themeOption.DARK ? themeOption.LIGHT : themeOption.DARK
	);

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
	if (!browser) return;

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

	theme.set(currentThemeOption);
}

/**
 * Sync theme changes to DOM and localStorage
 */
function syncTheme() {
	if (!browser) return;

	theme.subscribe((newTheme) => {
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

// Initialize theme on module load
initializeTheme();
syncTheme();
