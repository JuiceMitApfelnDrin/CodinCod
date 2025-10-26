import { z } from "zod";
import { gameVisibilitySchema } from "./visibility.schema.js";
import { DEFAULT_GAME_LENGTH_IN_SECONDS } from "../config/game-config.js";
import { gameModeSchema } from "./mode.schema.js";
import {
	puzzleLanguage,
	puzzleLanguageVersion,
} from "../../puzzle/schema/puzzle-language.js";
import { GameVisibilityEnum } from "../enum/game-visibility-enum.js";
import { GameModeEnum } from "../enum/game-mode-enum.js";

export const gameOptionsSchema = z.object({
	allowedLanguages: z
		.array(
			z.object({
				language: puzzleLanguage,
				version: puzzleLanguageVersion,
			}),
		)
		.prefault([]),
	maxGameDurationInSeconds: z.number().prefault(DEFAULT_GAME_LENGTH_IN_SECONDS),
	visibility: gameVisibilitySchema.prefault(GameVisibilityEnum.PUBLIC),
	mode: gameModeSchema.prefault(GameModeEnum.RATED),
});
export type GameOptions = z.infer<typeof gameOptionsSchema>;
