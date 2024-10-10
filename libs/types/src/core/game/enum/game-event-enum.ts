export const GameEvent = {
	// temporary, should be moved out somewhere else, atm is just to be able to create games and test the other stuff
	HOST_GAME: "game:host",

	START_GAME: "game:start",
	JOIN_GAME: "game:join",
	LEAVE_GAME: "game:leave",

	SUBMIT_CODE: "code:submit",

	SEND_MESSAGE: "message:send",

	// can possibly be removed, check if used later, keeping it for now in case
	UPDATE_PLAYERS: "player:update"
} as const;
