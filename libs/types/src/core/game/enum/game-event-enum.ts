import { ValueOf } from "../../common/index.js";

export const GameEventEnum = {
	// temporary, should be moved out somewhere else, atm is just to be able to create games and test the other stuff
	HOST_GAME: "game:host",

	START_GAME: "game:start",
	JOIN_GAME: "game:join",
	LEAVE_GAME: "game:leave",

	NONEXISTENT_GAME: "game:nonexistent",
	INCORRECT_VALUE: "value:incorrect",

	OVERVIEW_OF_GAMES: "games:overview",

	SUBMIT_CODE: "code:submit",

	SEND_MESSAGE: "message:send",

	// can possibly be removed, check if used later, keeping it for now in case
	UPDATE_PLAYERS: "player:update"
} as const;

export type GameEventEnum = typeof GameEventEnum;
export type KeyOfGameEvent = keyof GameEventEnum;
export type ValueOfGameEvent = ValueOf<GameEventEnum>;
