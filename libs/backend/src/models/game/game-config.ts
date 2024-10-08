import { Schema } from "mongoose";
import { GameVisibilityEnum } from "types";

/**
 * IDEA: Eventually add gameConfig types
 * there could be different gameConfigs, hidden generated by the system, and public testcases
 * this could mitigate users that just look at the public test cases and thus help catch code that technically is wrong, but passes the visible gameConfigs (to all users).
 */
const gameConfigSchema = new Schema({
	mexGameDurationInSeconds: {
		required: true,
		type: Number
	},
	visibility: {
		required: true,
		type: String,
		default: () => GameVisibilityEnum.PUBLIC
	}
});

export default gameConfigSchema;