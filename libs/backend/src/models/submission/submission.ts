import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { PUZZLE, SUBMISSION, USER } from "../../utils/constants/model.js";
import { SubmissionEntity } from "types";
import { resultInfoSchema } from "./result-info.js";

export interface SubmissionDocument extends Document, Omit<SubmissionEntity, "puzzle" | "user"> {
	puzzle: ObjectId;
	user: ObjectId;
}

const submissionSchema = new Schema<SubmissionDocument>({
	code: {
		required: true,
		select: false,
		type: String
	},
	createdAt: {
		default: Date.now,
		type: Date
	},
	language: {
		required: true,
		type: String
	},
	languageVersion: {
		required: true,
		type: String
	},
	puzzle: {
		ref: PUZZLE,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	result: {
		required: true,
		type: resultInfoSchema
	},
	user: {
		ref: USER,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
});

const Submission = mongoose.model<SubmissionDocument>(SUBMISSION, submissionSchema);
export default Submission;
