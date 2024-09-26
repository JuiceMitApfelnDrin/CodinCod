export const themeOptions = {
	DARK: "dark",
	LIGHT: "light"
} as const;

export type ThemeOption = (typeof themeOptions)[keyof typeof themeOptions];
const themeOptionsArray = Object.values(themeOptions);

export function isThemeOption(supposedTheme: unknown): supposedTheme is ThemeOption {
	return (
		typeof supposedTheme === "string" &&
		themeOptionsArray.findIndex((themeOption) => themeOption === supposedTheme) !== -1
	);
}
