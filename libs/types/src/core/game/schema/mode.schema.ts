import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { gameModeEnum } from "../enum/game-mode-enum.js";

export const gameModeSchema = z
	.enum(getValues(gameModeEnum))
	.prefault(gameModeEnum.FASTEST);
export type GameMode = z.infer<typeof gameModeSchema>;
