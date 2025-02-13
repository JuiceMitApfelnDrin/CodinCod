export const waitingRoomEventEnum = {
	START_GAME: "game:start",
	GO_TO_GAME: "room:go-to",

	HOST_ROOM: "room:host",
	JOIN_ROOM: "room:join",
	LEAVE_ROOM: "room:leave",
	OVERVIEW_ROOM: "room:overview",

	// error messages for room
	NONEXISTENT_ROOM: "room:nonexistent",
	NOT_ENOUGH_PUZZLES: "rooms:not-enough",

	// error messages for value
	INCORRECT_VALUE: "value:incorrect",

	OVERVIEW_OF_ROOMS: "rooms:overview"
} as const;
