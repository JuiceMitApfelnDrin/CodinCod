import { Schema } from "mongoose";
import { Solution } from "types";

const solutionSchema = new Schema<Solution>({
	code: {
		required: false,
		type: String
	},
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
