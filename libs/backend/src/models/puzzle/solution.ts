import { Schema } from "mongoose";
import { Solution } from "types";

const solutionSchema = new Schema<Solution>({
	code: {
		required: true,
		type: String
	},
	language: {
		required: true,
		type: String
	},
	languageVersion: {
		required: true,
		type: String
	}
});

export default solutionSchema;
