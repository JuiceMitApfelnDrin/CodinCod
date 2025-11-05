import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const themeOption = {
	DARK: "dark",
	LIGHT: "light",
} as const;

export const themeOptionSchema = z.enum(getValues(themeOption));

export type ThemeOption = z.infer<typeof themeOptionSchema>;

export const themeOptions = themeOptionSchema.options;

export function isThemeOption(
	supposedTheme: unknown,
): supposedTheme is ThemeOption {
	return themeOptionSchema.safeParse(supposedTheme).success;
}
