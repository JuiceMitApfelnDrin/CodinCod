import mongoose, { Schema } from "mongoose";
import { GameOptions } from "types";
import { PROGRAMMING_LANGUAGE } from "../../utils/constants/model.js";

/**
 * Game options schema
 * Defines configuration for game sessions including allowed languages, duration, visibility, and mode
 */
const gameOptionsSchema = new Schema<GameOptions>({
	maxGameDurationInSeconds: {
		required: true,
		type: Number
	},
	visibility: {
		required: true,
		type: String
	},
	allowedLanguages: [
		{
			ref: PROGRAMMING_LANGUAGE,
			required: false,
			type: mongoose.Schema.Types.ObjectId
		}
	],
	mode: {
		required: true,
		type: String
	}
});

export default gameOptionsSchema;
