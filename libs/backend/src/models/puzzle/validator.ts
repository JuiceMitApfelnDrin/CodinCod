import { Schema } from "mongoose";

/**
 * IDEA: Eventually add validator types
 * there could be different validators, hidden generated by the system, and public testcases
 * this could mitigate users that just look at the public test cases and thus help catch code that technically is wrong, but passes the visible validators (to all users).
 */
const validatorSchema = new Schema({
	createdAt: {
		default: Date.now,
		type: Date
	},
	input: {
		required: true,
		type: String
	},
	output: {
		required: true,
		type: String
	},
	updatedAt: {
		default: Date.now,
		type: Date
	}
});

export default validatorSchema;
