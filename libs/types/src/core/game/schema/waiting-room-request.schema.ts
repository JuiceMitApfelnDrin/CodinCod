import { z } from "zod";
import { waitingRoomEventEnum } from "../enum/waiting-room-event-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { gameOptionsSchema } from "./game-options.schema.js";

const baseMessageSchema = z.object({
	event: z.enum(getValues(waitingRoomEventEnum)),
});

const joinRoomSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.JOIN_ROOM),
	roomId: objectIdSchema,
});

const joinByInviteCodeSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.JOIN_BY_INVITE_CODE),
	inviteCode: z.string(),
});

const leaveRoomSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.LEAVE_ROOM),
	roomId: objectIdSchema,
});

const hostRoomSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.HOST_ROOM),
	options: gameOptionsSchema.optional(),
});

const startGameSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.START_GAME),
	roomId: objectIdSchema,
});

const chatMessageSchema = baseMessageSchema.extend({
	event: z.literal(waitingRoomEventEnum.CHAT_MESSAGE),
	roomId: objectIdSchema,
	message: z.string().min(1).max(500),
});

export const waitingRoomRequestSchema = z.discriminatedUnion("event", [
	joinRoomSchema,
	joinByInviteCodeSchema,
	leaveRoomSchema,
	hostRoomSchema,
	startGameSchema,
	chatMessageSchema,
]);

export type WaitingRoomRequest = z.infer<typeof waitingRoomRequestSchema>;

export function isWaitingRoomRequest(
	data: unknown,
): data is WaitingRoomRequest {
	return waitingRoomRequestSchema.safeParse(data).success;
}
