import mongoose, { ObjectId, Schema } from "mongoose";
import { PUZZLE, SUBMISSION, USER } from "../../utils/constants/model.js";
import { SubmissionEntity } from "types";

export interface SubmissionDocument extends Document, Omit<SubmissionEntity, "puzzleId" | "userId"> {
	puzzleId: ObjectId;
	userId: ObjectId;
}

const submissionSchema = new Schema<SubmissionDocument>({
	code: {
		required: true,
		type: String
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
	}
});

const Submission = mongoose.model<SubmissionDocument>(SUBMISSION, submissionSchema);
export default Submission;
