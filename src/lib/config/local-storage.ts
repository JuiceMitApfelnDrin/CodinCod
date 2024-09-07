export const localStorageKeys = {
	THEME: "theme"
} as const;

export const themeOptions = {
	DARK: "dark",
	LIGHT: "light"
} as const;

export type ThemeOption = (typeof themeOptions)[keyof typeof themeOptions];
