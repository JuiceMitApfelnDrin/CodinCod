import { z } from "zod";
import { GameVisibilityEnum } from "../enum/game-visibility-enum.js";

export const gameVisibilitySchema = z.enum([GameVisibilityEnum.PRIVATE, GameVisibilityEnum.PUBLIC]);
export type GameVisibility = z.infer<typeof gameVisibilitySchema>;
