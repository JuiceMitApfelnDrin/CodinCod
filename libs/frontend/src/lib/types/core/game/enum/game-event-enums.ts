import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const gameEventEnum = {
	JOIN_GAME: "game:join",
	OVERVIEW_GAME: "game:overview",

	// error messages for game
	NONEXISTENT_GAME: "game:nonexistent",
	FINISHED_GAME: "game:finished",

	ERROR: "error",

	CHANGE_LANGUAGE: "language:change",

	SEND_MESSAGE: "message:send",

	SUBMITTED_PLAYER: "player:submitted",
} as const;

export const gameEventSchema = z.enum(getValues(gameEventEnum));
