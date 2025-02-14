import { z } from "zod";
import { gameDtoSchema } from "./game-dto.schema.js";
import { chatMessageSchema } from "../../chat/schema/chat-message.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { gameEventEnum } from "../enum/game-event-enums.js";

const gameErrorResponseSchema = z.object({
	event: z.literal(gameEventEnum.ERROR),
	message: z.string()
});
const gameOverviewResponseSchema = z.object({
	event: z.literal(gameEventEnum.OVERVIEW_GAME),
	game: gameDtoSchema,
	puzzle: puzzleDtoSchema.optional()
});
const nonexistentGameResponseSchema = z.object({
	event: z.literal(gameEventEnum.NONEXISTENT_GAME),
	message: z.string()
});
const sendMessageGameResponseSchema = z.object({
	event: z.literal(gameEventEnum.SEND_MESSAGE),
	chatMessage: chatMessageSchema
});
const changeLanguageGameResponseSchema = z.object({
	event: z.literal(gameEventEnum.CHANGE_LANGUAGE),
	language: z.string(),
	username: z.string()
});
const finishedGameGameResponseSchema = z.object({
	event: z.literal(gameEventEnum.FINISHED_GAME),
	game: gameDtoSchema
});

const gameResponseSchema = z.discriminatedUnion("event", [
	gameErrorResponseSchema,
	gameOverviewResponseSchema,
	nonexistentGameResponseSchema,
	sendMessageGameResponseSchema,
	changeLanguageGameResponseSchema,
	finishedGameGameResponseSchema
]);

export type GameResponse = z.infer<typeof gameResponseSchema>;

export function isGameResponse(data: any): data is GameResponse {
	return gameResponseSchema.safeParse(data).success;
}
