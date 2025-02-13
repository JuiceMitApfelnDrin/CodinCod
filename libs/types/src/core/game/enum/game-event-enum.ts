export const GameEventEnum = {
	JOIN_GAME: "game:join",
	OVERVIEW_GAME: "game:overview",

	// error messages for game
	NONEXISTENT_GAME: "game:nonexistent",
	FINISHED_GAME: "game:finished",

	// error messages for value
	INCORRECT_VALUE: "value:incorrect",

	CHANGE_LANGUAGE: "language:change",

	SEND_MESSAGE: "message:send",
	SEND_MESSAGE_FAILED: "message:send:failed",

	SUBMITTED_PLAYER: "player:submitted"
} as const;
