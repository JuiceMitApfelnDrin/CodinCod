import { Schema } from "mongoose";
import { GameOptions, GameVisibilityEnum } from "types";
import languageSchema from "../programming-language/language.js";

/**
 * IDEA: Eventually add gameOptions types
 * there could be different gameOptions, hidden generated by the system, and public test-cases
 * this could mitigate users that just look at the public test cases and thus help catch code that technically is wrong, but passes the visible gameOptionss (to all users).
 */
const gameOptionsSchema = new Schema<GameOptions>({
	maxGameDurationInSeconds: {
		required: true,
		type: Number
	},
	visibility: {
		required: true,
		type: String,
		default: () => GameVisibilityEnum.PUBLIC
	},
	allowedLanguages: [languageSchema]
});

export default gameOptionsSchema;
