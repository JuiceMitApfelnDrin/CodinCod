import { z } from "zod";
import { GameEventEnum } from "../enum/game-event-enum.js";
import { acceptedDateSchema, messageSchema } from "../../common/index.js";

export const gameSessionSchema = z.object({
	event: z.enum([
		GameEventEnum.HOST_GAME,
		GameEventEnum.JOIN_GAME,
		GameEventEnum.LEAVE_GAME,
		GameEventEnum.SEND_MESSAGE,
		GameEventEnum.START_GAME,
		GameEventEnum.SUBMIT_CODE,
		GameEventEnum.UPDATE_PLAYERS
	]),
	gameId: z.string(),
	username: z.ostring().optional(),
	message: messageSchema.optional(),
	userId: z.ostring(),
	joinedAt: acceptedDateSchema.optional()
});
export type GameSession = z.infer<typeof gameSessionSchema>;
