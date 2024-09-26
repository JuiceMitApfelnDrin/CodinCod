import { Schema } from "mongoose";

const solutionSchema = new Schema({
	code: {
		type: String
	},
	language: {
		type: String
	}
});

export default solutionSchema;
