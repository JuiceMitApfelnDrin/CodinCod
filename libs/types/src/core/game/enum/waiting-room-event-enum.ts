export const waitingRoomEventEnum = {
	START_GAME: "game:start",
	GO_TO_GAME: "room:go-to",

	HOST_ROOM: "room:host",
	JOIN_ROOM: "room:join",
	LEAVE_ROOM: "room:leave",
	OVERVIEW_ROOM: "room:overview",

	// error messages for room
	NONEXISTENT_ROOM: "room:nonexistent",
	FINISHED_ROOM: "room:finished",
	ALREADY_JOINED_ROOM: "room:already-joined",
	NOT_ENOUGH_ROOMS: "rooms:not-enough",

	// error messages for value
	INCORRECT_VALUE: "value:incorrect",

	OVERVIEW_OF_ROOMS: "rooms:overview",

	SUBMIT_CODE: "code:submit",
	ALREADY_SUBMITTED_CODE: "code:already-submitted",

	SEND_MESSAGE: "message:send",
	SEND_MESSAGE_FAILED: "message:send:failed",

	// can possibly be removed, check if used later, keeping it for now in case
	UPDATE_PLAYERS: "player:update",
	FINISHED_PLAYER: "player:finished",
	SUBMITTED_PLAYER: "player:submitted"
} as const;
