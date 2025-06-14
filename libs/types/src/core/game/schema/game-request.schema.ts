import { z } from "zod";
import { chatMessageSchema } from "../../chat/schema/chat-message.schema.js";
import { gameEventEnum } from "../enum/game-event-enums.js";

const joinGameRequestSchema = z.object({
	event: z.literal(gameEventEnum.JOIN_GAME),
});
const changeLanguageGameRequestSchema = z.object({
	event: z.literal(gameEventEnum.CHANGE_LANGUAGE),
	language: z.string(),
});
const sendMessageGameRequestSchema = z.object({
	event: z.literal(gameEventEnum.SEND_MESSAGE),
	chatMessage: chatMessageSchema,
});
const submittedPlayerGameRequestSchema = z.object({
	event: z.literal(gameEventEnum.SUBMITTED_PLAYER),
});

export const gameRequestSchema = z.discriminatedUnion("event", [
	joinGameRequestSchema,
	changeLanguageGameRequestSchema,
	sendMessageGameRequestSchema,
	submittedPlayerGameRequestSchema,
]);

export type GameRequest = z.infer<typeof gameRequestSchema>;

export function isGameRequest(data: any): data is GameRequest {
	return gameRequestSchema.safeParse(data).success;
}
