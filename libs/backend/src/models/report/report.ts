import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { ProblemTypeEnum, ReportEntity, reviewStatusEnum } from "types";
import { REPORT, USER } from "../../utils/constants/model.js";

export interface ReportDocument
	extends Document,
		Omit<ReportEntity, "reportedBy" | "resolvedBy" | "problematicIdentifier"> {
	reportedBy: ObjectId;
	resolvedBy?: ObjectId;
	problematicIdentifier: ObjectId;
}

const reportSchema = new Schema<ReportDocument>({
	problematicIdentifier: {
		type: Schema.Types.ObjectId,
		required: true,
		refPath: "problemType"
	},
	problemType: {
		type: String,
		required: true,
		enum: [ProblemTypeEnum.PUZZLE, ProblemTypeEnum.USER, ProblemTypeEnum.COMMENT]
	},
	reportedBy: {
		type: Schema.Types.ObjectId,
		ref: USER,
		required: true
	},
	explanation: {
		type: String,
		required: true
	},
	status: {
		type: String,
		enum: [
			reviewStatusEnum.PENDING,
			reviewStatusEnum.RESOLVED,
			reviewStatusEnum.REJECTED
		],
		default: reviewStatusEnum.PENDING,
		required: true
	},
	resolvedBy: {
		type: Schema.Types.ObjectId,
		ref: USER,
		required: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Create indexes for common queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ problemType: 1, status: 1 });
reportSchema.index({ reportedBy: 1 });

const Report = mongoose.model<ReportDocument>(REPORT, reportSchema);
export default Report;
