import mongoose from "mongoose";
import { PUZZLE, SUBMISSION, USER } from "../../utils/constants/model.js";

const submissionSchema = new mongoose.Schema({
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

const Submission = mongoose.model(SUBMISSION, submissionSchema);
export default Submission;
