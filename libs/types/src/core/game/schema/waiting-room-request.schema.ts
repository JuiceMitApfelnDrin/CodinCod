import { z } from "zod";
import { waitingRoomEventEnum } from "../enum/waiting-room-event-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

const baseMessageSchema = z.object({
	event: z.enum(getValues(waitingRoomEventEnum))
});

const joinRoomSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.JOIN_ROOM),
	roomId: objectIdSchema
});

const leaveRoomSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.LEAVE_ROOM),
	roomId: objectIdSchema
});

const hostRoomSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.HOST_ROOM)
});

const startGameSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.START_GAME),
	roomId: objectIdSchema
});

export const waitingRoomRequestSchema = z.discriminatedUnion("event", [
	joinRoomSchema,
	leaveRoomSchema,
	hostRoomSchema,
	startGameSchema
]);

export type WaitingRoomRequest = z.infer<typeof waitingRoomRequestSchema>;

export function isWaitingRoomRequest(data: any): data is WaitingRoomRequest {
	return waitingRoomRequestSchema.safeParse(data).success;
}
