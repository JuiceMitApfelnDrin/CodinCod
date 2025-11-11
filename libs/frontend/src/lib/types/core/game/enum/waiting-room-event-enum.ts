import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const waitingRoomEventEnum = {
	// Server → Client events
	START_GAME: "start_game",
	GAME_STARTING_COUNTDOWN: "game_starting_countdown",
	OVERVIEW_ROOM: "overview_room",
	OVERVIEW_OF_ROOMS: "overview_of_rooms",
	CHAT_MESSAGE: "chat_message",
	NOT_ENOUGH_PUZZLES: "not_enough_puzzles",
	ERROR: "error",

	// Client → Server events
	HOST_ROOM: "host_room",
	JOIN_ROOM: "join_room",
	JOIN_BY_INVITE_CODE: "join_by_invite_code",
	LEAVE_ROOM: "leave_room"
} as const;

export const waitingRoomEventSchema = z.enum(getValues(waitingRoomEventEnum));
