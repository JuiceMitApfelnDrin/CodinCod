export const GameEventEnum = {
	// temporary, should be moved out somewhere else, atm is just to be able to create games and test the other stuff
	HOST_GAME: "game:host",

	START_GAME: "game:start",
	JOIN_GAME: "game:join",
	LEAVE_GAME: "game:leave",
	GO_TO_GAME: "game:go-to",
	OVERVIEW_GAME: "game:overview",

	// error messages for game
	NONEXISTENT_GAME: "game:nonexistent",
	FINISHED_GAME: "game:finished",
	ALREADY_JOINED_GAME: "game:already-joined",
	NOT_ENOUGH_GAMES: "games:not-enough",

	// error messages for value
	INCORRECT_VALUE: "value:incorrect",

	OVERVIEW_OF_GAMES: "games:overview",

	SUBMIT_CODE: "code:submit",
	ALREADY_SUBMITTED_CODE: "code:already-submitted",

	CHANGE_LANGUAGE: "language:change",

	SEND_MESSAGE: "message:send",
	SEND_MESSAGE_FAILED: "message:send:failed",

	// can possibly be removed, check if used later, keeping it for now in case
	UPDATE_PLAYERS: "player:update",
	FINISHED_PLAYER: "player:finished",
	SUBMITTED_PLAYER: "player:submitted"
} as const;
