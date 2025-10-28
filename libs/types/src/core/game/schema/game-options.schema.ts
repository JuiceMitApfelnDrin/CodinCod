import { z } from "zod";
import { gameVisibilitySchema } from "./visibility.schema.js";
import { DEFAULT_GAME_LENGTH_IN_SECONDS } from "../config/game-config.js";
import { gameModeSchema } from "./mode.schema.js";
import { programmingLanguageDtoSchema } from "../../programming-language/schema/programming-language-dto.schema.js";
import { GameVisibilityEnum } from "../enum/game-visibility-enum.js";
import { GameModeEnum } from "../enum/game-mode-enum.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const gameOptionsSchema = z.object({
	allowedLanguages: z
		.array(objectIdSchema.or(programmingLanguageDtoSchema))
		.prefault([]),
	maxGameDurationInSeconds: z.number().prefault(DEFAULT_GAME_LENGTH_IN_SECONDS),
	visibility: gameVisibilitySchema.prefault(GameVisibilityEnum.PUBLIC),
	mode: gameModeSchema.prefault(GameModeEnum.FASTEST),
});
export type GameOptions = z.infer<typeof gameOptionsSchema>;
