import { z } from "zod";
import { GameVisibilityEnum } from "../enum/game-visibility-enum.js";
import { getValues } from "../../../utils/functions/getValues.js";

export const gameVisibilitySchema = z.enum(getValues(GameVisibilityEnum));
export type GameVisibility = z.infer<typeof gameVisibilitySchema>;
