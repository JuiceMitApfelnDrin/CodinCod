import { z } from "zod";
import { LanguageLabelEnum } from "../../config/languages.js";
import { gameVisibilitySchema } from "./game-visibility.schema.js";

export const gameConfigSchema = z.object({
	allowedLanguages: z.array(
		z.object({
			language: LanguageLabelEnum,
			languageVersion: z.string()
		})
	),
	maxGameDurationInSeconds: z.number().default(15 * 60),
	visibility: gameVisibilitySchema
});
export type GameConfig = z.infer<typeof gameConfigSchema>;
