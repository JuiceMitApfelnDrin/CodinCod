import { z } from "zod";
import { getValues } from "../../../utils/functions/getValues.js";
import { GameModeEnum } from "../enum/game-mode-enum.js";

export const gameModeSchema = z.enum(getValues(GameModeEnum)).default(GameModeEnum.RATED);
export type GameMode = z.infer<typeof gameModeSchema>;
