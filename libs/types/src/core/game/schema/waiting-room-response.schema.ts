import { z } from "zod";
import { waitingRoomEventEnum } from "../enum/waiting-room-event-enum.js";
import { gameUserInfoSchema } from "./game-user-info.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

const joinRoomResponseSchema = z.object({ event: z.literal(waitingRoomEventEnum.JOIN_ROOM) });
const leaveRoomResponseSchema = z.object({ event: z.literal(waitingRoomEventEnum.LEAVE_ROOM) });
const hostRoomResponseSchema = z.object({ event: z.literal(waitingRoomEventEnum.HOST_ROOM) });
const startGameResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.START_GAME),
	gameUrl: z.string()
});

const roomStateResponseSchema = z.object({
	users: z.array(gameUserInfoSchema),
	owner: gameUserInfoSchema,
	roomId: objectIdSchema
});
export type RoomStateResponse = z.infer<typeof roomStateResponseSchema>;

const overviewRoomResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.OVERVIEW_ROOM),
	room: roomStateResponseSchema
});
const notEnoughPuzzles = z.object({
	event: z.literal(waitingRoomEventEnum.NOT_ENOUGH_PUZZLES),
	message: z.string()
});
const waitingRoomErrorResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.ERROR),
	message: z.string()
});

const roomOverviewResponseSchema = z.object({
	roomId: z.string(),
	amountOfPlayersJoined: z.number()
});
export type RoomOverviewResponse = z.infer<typeof roomOverviewResponseSchema>;

const overviewOfRoomsResponseSchema = z.object({
	event: z.literal(waitingRoomEventEnum.OVERVIEW_OF_ROOMS),
	rooms: z.array(roomOverviewResponseSchema)
});

export const waitingRoomResponseSchema = z.discriminatedUnion("event", [
	joinRoomResponseSchema,
	leaveRoomResponseSchema,
	hostRoomResponseSchema,
	startGameResponseSchema,
	overviewRoomResponseSchema,
	notEnoughPuzzles,
	waitingRoomErrorResponseSchema,
	overviewOfRoomsResponseSchema
]);

export type WaitingRoomResponse = z.infer<typeof waitingRoomResponseSchema>;

export function isWaitingRoomResponse(data: any): data is WaitingRoomResponse {
	return waitingRoomResponseSchema.safeParse(data).success;
}
