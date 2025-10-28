import { z } from "zod";
import { waitingRoomEventEnum } from "../enum/waiting-room-event-enum.js";
import { gameUserInfoSchema } from "./game-user-info.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

const startGameResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.START_GAME),
	gameUrl: z.string(),
	startTime: acceptedDateSchema,
});

const gameStartingCountdownResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.GAME_STARTING_COUNTDOWN),
	secondsRemaining: z.number(),
	gameUrl: z.string(),
});

const roomStateResponseSchema = z.object({
	users: z.array(gameUserInfoSchema),
	owner: gameUserInfoSchema,
	roomId: objectIdSchema,
	inviteCode: z.string().optional(),
});
export type RoomStateResponse = z.infer<typeof roomStateResponseSchema>;

const overviewRoomResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.OVERVIEW_ROOM),
	room: roomStateResponseSchema,
});
const notEnoughPuzzles = z.object({
	event: z.literal(waitingRoomEventEnum.NOT_ENOUGH_PUZZLES),
	message: z.string(),
});
const waitingRoomErrorResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.ERROR),
	message: z.string(),
});

const roomOverviewResponseSchema = z.object({
	roomId: z.string(),
	amountOfPlayersJoined: z.number(),
});
export type RoomOverviewResponse = z.infer<typeof roomOverviewResponseSchema>;

const overviewOfRoomsResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.OVERVIEW_OF_ROOMS),
	rooms: z.array(roomOverviewResponseSchema),
});

const chatMessageResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.CHAT_MESSAGE),
	username: z.string(),
	message: z.string(),
	timestamp: acceptedDateSchema,
});

export const waitingRoomResponseSchema = z.discriminatedUnion("event", [
	startGameResponseSchema,
	gameStartingCountdownResponseSchema,
	overviewRoomResponseSchema,
	notEnoughPuzzles,
	waitingRoomErrorResponseSchema,
	overviewOfRoomsResponseSchema,
	chatMessageResponseSchema,
]);

export type WaitingRoomResponse = z.infer<typeof waitingRoomResponseSchema>;

export function isWaitingRoomResponse(
	data: unknown,
): data is WaitingRoomResponse {
	return waitingRoomResponseSchema.safeParse(data).success;
}
