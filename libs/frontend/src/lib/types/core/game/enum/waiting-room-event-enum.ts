import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const waitingRoomEventEnum = {
	START_GAME: "game:start",
	GAME_STARTING_COUNTDOWN: "game:starting-countdown",

	HOST_ROOM: "room:host",
	JOIN_ROOM: "room:join",
	JOIN_BY_INVITE_CODE: "room:join-by-invite",
	LEAVE_ROOM: "room:leave",
	OVERVIEW_ROOM: "room:overview",

	CHAT_MESSAGE: "room:chat-message",

	NOT_ENOUGH_PUZZLES: "rooms:not-enough",
	ERROR: "error",

	OVERVIEW_OF_ROOMS: "rooms:overview",
} as const;

export const waitingRoomEventSchema = z.enum(getValues(waitingRoomEventEnum));
