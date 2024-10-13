import { z } from "zod";
import { gameSessionSchema } from "./session.schema.js";
import { authenticatedInfoSchema } from "../../authentication/index.js";
import { acceptedDateSchema } from "../../common/index.js";
import WebSocket from "ws";

export const gameEventSchema = gameSessionSchema.pick({
	event: true,
	gameId: true,
	userId: true,
	username: true
});
export type GameEvent = z.infer<typeof gameEventSchema>;
