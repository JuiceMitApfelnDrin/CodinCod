import { z } from "zod";
import { GameEventEnum } from "../enum/game-event-enum.js";
import { getValues } from "../../../utils/functions/getValues.js";

export const gameEventSchema = z.enum(getValues(GameEventEnum));
export type GameEvent = z.infer<typeof gameEventSchema>;
