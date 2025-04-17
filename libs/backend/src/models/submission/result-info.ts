import { Schema } from "mongoose";
import { PuzzleResultInformation } from "types";

export const resultInfoSchema = new Schema<PuzzleResultInformation>({
	result: {
		required: true,
		type: String
	},
	successRate: {
		required: true,
		type: Number
	}
});
