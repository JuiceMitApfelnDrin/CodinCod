import { z } from "zod";
import { gameSessionSchema } from "./session.schema.js";
import { authenticatedInfoSchema } from "../../authentication/index.js";
import { acceptedDateSchema } from "../../common/index.js";

export const gameEventSchema = gameSessionSchema.pick({
	event: true,
	gameId: true,
	userId: true,
	username: true
});
export type GameEvent = z.infer<typeof gameEventSchema>;

export const gameEventUserInfoSchema = z.object({
	userId: authenticatedInfoSchema.shape.userId,
	username: authenticatedInfoSchema.shape.username,
	joinedAt: acceptedDateSchema,
	socket: z.any()
});
export type GameEventUserInfo = z.infer<typeof gameEventUserInfoSchema> & { socket: WebSocket };
