import { z } from "zod";
import { gameVisibilityEnum } from "../enum/game-visibility-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

export const gameVisibilitySchema = z
	.enum(getValues(gameVisibilityEnum))
	.prefault(gameVisibilityEnum.PUBLIC);
export type GameVisibility = z.infer<typeof gameVisibilitySchema>;
