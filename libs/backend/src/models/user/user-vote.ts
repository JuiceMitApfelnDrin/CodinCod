import { USER, USER_VOTE } from "@/utils/constants/model.js";
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { UserVoteEntity } from "types";

interface UserVoteDocument extends Document, Omit<UserVoteEntity, "author"> {
	author: ObjectId;
}

const userVoteSchema = new Schema<UserVoteDocument>({
	author: {
		ref: USER,
		required: true,
		type: Schema.Types.ObjectId
	},
	createdAt: {
		default: Date.now,
		type: Date
	},
	type: {
		required: true,
		type: String
	},
	votedOn: {
		required: true,
		type: String
	}
});

userVoteSchema.index({ author: 1, votedOn: 1 }, { background: true });
userVoteSchema.index({ votedOn: 1 }, { background: true });

const UserVote = mongoose.model<UserVoteDocument>(USER_VOTE, userVoteSchema);
export default UserVote;
