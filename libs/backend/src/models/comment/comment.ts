import { COMMENT, USER } from "@/utils/constants/model.js";
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { commentTypeEnum, type CommentEntity } from "types";

export interface CommentDocument extends Document, Omit<CommentEntity, "author"> {
	_id: ObjectId;
	author: ObjectId;
}

export const commentSchema = new Schema<CommentDocument>({
	author: {
		ref: USER,
		required: true,
		type: Schema.Types.ObjectId
	},
	commentType: {
		default: commentTypeEnum.COMMENT,
		required: true,
		type: String
	},
	comments: [
		{
			ref: COMMENT,
			type: Schema.Types.ObjectId
		}
	],
	createdAt: {
		default: Date.now,
		type: Date
	},
	downvote: {
		default: 0,
		required: true,
		type: Number
	},
	text: {
		required: true,
		type: String
	},
	updatedAt: {
		default: Date.now,
		type: Date
	},
	upvote: {
		default: 0,
		required: true,
		type: Number
	}
});

commentSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
	await Comment.deleteMany({ _id: { $in: this.comments } });

	next();
});

const Comment = mongoose.model<CommentDocument>(COMMENT, commentSchema);
export default Comment;
