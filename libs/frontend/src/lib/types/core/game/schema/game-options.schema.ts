import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { programmingLanguageDtoSchema } from "../../programming-language/schema/programming-language-dto.schema.js";
import { DEFAULT_GAME_LENGTH_IN_SECONDS } from "../config/game-config.js";
import { gameModeEnum } from "../enum/game-mode-enum.js";
import { gameVisibilityEnum } from "../enum/game-visibility-enum.js";
import { gameModeSchema } from "./mode.schema.js";
import { gameVisibilitySchema } from "./visibility.schema.js";

export const gameOptionsSchema = z.object({
	allowedLanguages: z
		.array(objectIdSchema.or(programmingLanguageDtoSchema))
		.prefault([]),
	maxGameDurationInSeconds: z.number().prefault(DEFAULT_GAME_LENGTH_IN_SECONDS),
	visibility: gameVisibilitySchema.prefault(gameVisibilityEnum.PUBLIC),
	mode: gameModeSchema.prefault(gameModeEnum.FASTEST),
	rated: z.boolean().default(true)
});

export type GameOptions = z.infer<typeof gameOptionsSchema>;
