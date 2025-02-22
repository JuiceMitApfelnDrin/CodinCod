import { Schema } from "mongoose";
import { PuzzleResultInformation } from "types";

export const resultInfoSchema = new Schema<PuzzleResultInformation>({
	result: {
		type: String,
		required: true
	},
	successRate: {
		type: Number,
		required: true
	}
});
