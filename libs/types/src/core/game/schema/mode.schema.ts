import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { GameModeEnum } from "../enum/game-mode-enum.js";

export const gameModeSchema = z
	.enum(getValues(GameModeEnum))
	.prefault(GameModeEnum.RATED);
export type GameMode = z.infer<typeof gameModeSchema>;
