import { z } from "zod";
import { gameSessionSchema } from "./session.schema.js";

export const gameEventSchema = gameSessionSchema.pick({
	event: true,
	gameId: true,
	userId: true,
	username: true
});
export type GameEvent = z.infer<typeof gameEventSchema>;
