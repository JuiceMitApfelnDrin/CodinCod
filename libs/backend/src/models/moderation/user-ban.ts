import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { UserBanEntity, banTypeEnum } from "types";
import { USER_BAN, USER } from "../../utils/constants/model.js";

export interface UserBanDocument
	extends Document,
		Omit<UserBanEntity, "userId" | "bannedBy" | "_id"> {
	userId: ObjectId;
	bannedBy: ObjectId;
}

const userBanSchema = new Schema<UserBanDocument>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: USER,
		required: true
	},
	bannedBy: {
		type: Schema.Types.ObjectId,
		ref: USER,
		required: true
	},
	banType: {
		type: String,
		enum: [banTypeEnum.TEMPORARY, banTypeEnum.PERMANENT],
		required: true
	},
	reason: {
		type: String,
		required: true,
		minlength: 10,
		maxlength: 500
	},
	startDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	endDate: {
		type: Date,
		required: false // Not required for permanent bans
	},
	isActive: {
		type: Boolean,
		default: true
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

// Indexes for efficient querying
userBanSchema.index({ userId: 1, isActive: 1 });
userBanSchema.index({ userId: 1, createdAt: -1 });
userBanSchema.index({ endDate: 1, isActive: 1 }); // For expiration checks

const UserBan = mongoose.model<UserBanDocument>(USER_BAN, userBanSchema);

export default UserBan;
