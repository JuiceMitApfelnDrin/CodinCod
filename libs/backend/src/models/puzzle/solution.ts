import mongoose, { Schema } from "mongoose";
import { Solution } from "types";
import { PROGRAMMING_LANGUAGE } from "../../utils/constants/model.js";

const solutionSchema = new Schema<Solution>({
	code: {
		required: false,
		type: String
	},
	programmingLanguage: {
		ref: PROGRAMMING_LANGUAGE,
		required: false,
		type: mongoose.Schema.Types.ObjectId
	},
	// Deprecated fields - keeping for backward compatibility during migration
	language: {
		required: false,
		type: String
	},
	languageVersion: {
		required: false,
		type: String
	}
});

export default solutionSchema;
