import { z } from "zod";
import { GameVisibilityEnum } from "../../enums/game-visibility-enum.js";

export const gameVisibilitySchema = z.enum([GameVisibilityEnum.PRIVATE, GameVisibilityEnum.PUBLIC]);
export type GameVisibility = z.infer<typeof gameVisibilitySchema>;
