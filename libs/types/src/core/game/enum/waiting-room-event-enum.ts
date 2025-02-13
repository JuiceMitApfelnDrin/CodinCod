import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const waitingRoomEventEnum = {
	START_GAME: "game:start",

	HOST_ROOM: "room:host",
	JOIN_ROOM: "room:join",
	LEAVE_ROOM: "room:leave",
	OVERVIEW_ROOM: "room:overview",

	NOT_ENOUGH_PUZZLES: "rooms:not-enough",
	ERROR: "error",

	OVERVIEW_OF_ROOMS: "rooms:overview"
} as const;

export const waitingRoomEventSchema = z.enum(getValues(waitingRoomEventEnum));
