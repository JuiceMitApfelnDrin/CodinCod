import { browser } from "$app/environment";
import { localStorageKeys, themeOptions, type ThemeOption } from "@/config/local-storage";
import { writable } from "svelte/store";

export const theme = writable<ThemeOption>();

if (browser) {
    theme.subscribe((newTheme) => {
        const isDarkTheme = newTheme === themeOptions.DARK;

        if (isDarkTheme) {
            document.documentElement.classList.add(themeOptions.DARK);
            localStorage.setItem(localStorageKeys.THEME, themeOptions.DARK);
        } else {
            document.documentElement.classList.remove(themeOptions.DARK);
            localStorage.setItem(localStorageKeys.THEME, themeOptions.LIGHT);
        }
    });
}
