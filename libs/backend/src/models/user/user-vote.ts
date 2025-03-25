import { USER, USER_VOTE } from "@/utils/constants/model.js";
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { UserVoteEntity } from "types";

interface UserVoteDocument extends Document, Omit<UserVoteEntity, "author"> {
	author: ObjectId;
}

const userVoteSchema = new Schema<UserVoteDocument>({
	createdAt: {
		default: Date.now,
		type: Date
	},
	type: {
		type: String,
		required: true
	},
	votedOn: {
		type: String,
		required: true
	},
	author: {
		ref: USER,
		type: Schema.Types.ObjectId,
		required: true
	}
});

userVoteSchema.index({ author: 1, votedOn: 1 }, { background: true });
userVoteSchema.index({ votedOn: 1 }, { background: true });

const UserVote = mongoose.model<UserVoteDocument>(USER_VOTE, userVoteSchema);
export default UserVote;
