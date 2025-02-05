import mongoose, { ObjectId, Schema } from "mongoose";
import { PUZZLE, SUBMISSION, USER } from "../../utils/constants/model.js";
import { SubmissionEntity } from "types";

export interface SubmissionDocument
	extends Document,
		Omit<SubmissionEntity, "puzzleId" | "userId"> {
	puzzleId: ObjectId;
	userId: ObjectId;
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
	puzzleId: {
		ref: PUZZLE,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	result: {
		required: true,
		type: String
	},
	userId: {
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

submissionSchema.virtual("user", {
	ref: USER,
	localField: "userId",
	foreignField: "_id",
	justOne: true
});

const Submission = mongoose.model<SubmissionDocument>(SUBMISSION, submissionSchema);
export default Submission;
