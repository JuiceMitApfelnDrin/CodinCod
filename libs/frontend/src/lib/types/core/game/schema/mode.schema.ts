import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { gameModeEnum } from "../enum/game-mode-enum.js";

export const gameModes = getValues(gameModeEnum);

export const gameModeSchema = z.enum(gameModes).prefault(gameModeEnum.FASTEST);
export type GameMode = z.infer<typeof gameModeSchema>;

export function isGameMode(data: unknown): data is GameMode {
	return gameModeSchema.safeParse(data).success;
}
