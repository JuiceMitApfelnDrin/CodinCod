import { z } from "zod";
import { GameVisibilityEnum } from "../enum/game-visibility-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

export const gameVisibilitySchema = z
	.enum(getValues(GameVisibilityEnum))
	.prefault(GameVisibilityEnum.PUBLIC);
export type GameVisibility = z.infer<typeof gameVisibilitySchema>;
