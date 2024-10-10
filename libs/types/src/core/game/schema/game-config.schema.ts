import { z } from "zod";
import { gameVisibilitySchema } from "./game-visibility.schema.js";
import { LanguageLabelEnum } from "../../puzzle/index.js";
import { DEFAULT_GAME_LENGTH_IN_SECONDS } from "../config/game.js";

export const gameConfigSchema = z.object({
	allowedLanguages: z.array(
		z.object({
			language: LanguageLabelEnum,
			languageVersion: z.string()
		})
	),
	maxGameDurationInSeconds: z.number().default(DEFAULT_GAME_LENGTH_IN_SECONDS),
	visibility: gameVisibilitySchema
});
export type GameConfig = z.infer<typeof gameConfigSchema>;
