import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { PUZZLE, SUBMISSION, USER } from "../../utils/constants/model.js";
import { SubmissionEntity } from "types";
import { resultInfoSchema } from "./result-info.js";

export interface SubmissionDocument
	extends Document,
		Omit<SubmissionEntity, "puzzle" | "user"> {
	puzzle: ObjectId;
	user: ObjectId;
}

const submissionSchema = new Schema<SubmissionDocument>({
	code: {
		required: true,
		type: String,
		select: false
	},
	createdAt: {
		default: Date.now,
		type: Date
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

const Submission = mongoose.model<SubmissionDocument>(
	SUBMISSION,
	submissionSchema
);
export default Submission;
