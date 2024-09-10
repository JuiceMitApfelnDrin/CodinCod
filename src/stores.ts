import { browser } from "$app/environment";
import { localStorageKeys, themeOptions, type ThemeOption } from "@/config/local-storage";
import { derived, writable } from "svelte/store";

const theme = writable<ThemeOption>();
export const isDarkTheme = derived(theme, currentTheme => currentTheme === themeOptions.DARK);
export const toggleDarkTheme = () => theme.update(oldValue => oldValue === themeOptions.DARK ? themeOptions.LIGHT : themeOptions.DARK)

if (browser) {
    const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const storedTheme = localStorage.getItem(localStorageKeys.THEME) as ThemeOption | null;
    const preferredTheme = prefersDarkTheme ? themeOptions.DARK : themeOptions.LIGHT;
    theme.set(storedTheme ?? preferredTheme)

    theme.subscribe((newTheme) => {
        if (newTheme === themeOptions.DARK) {
            document.documentElement.classList.add(themeOptions.DARK);
        } else {
            document.documentElement.classList.remove(themeOptions.DARK);
        }
        localStorage.setItem(localStorageKeys.THEME, newTheme);
    });
}
