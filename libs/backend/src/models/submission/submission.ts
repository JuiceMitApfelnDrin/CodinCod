import mongoose, { Document, ObjectId, Schema } from "mongoose";
import {
	PROGRAMMING_LANGUAGE,
	PUZZLE,
	SUBMISSION,
	USER
} from "../../utils/constants/model.js";
import { SubmissionEntity } from "types";
import { resultInfoSchema } from "./result-info.js";

export interface SubmissionDocument
	extends Document,
		Omit<SubmissionEntity, "puzzle" | "user" | "programmingLanguage"> {
	puzzle: ObjectId;
	user: ObjectId;
	programmingLanguage: ObjectId;
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
	programmingLanguage: {
		ref: PROGRAMMING_LANGUAGE,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
});

const Submission = mongoose.model<SubmissionDocument>(
	SUBMISSION,
	submissionSchema
);
export default Submission;
