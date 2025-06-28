import { COMMENT, USER } from "@/utils/constants/model.js";
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { commentTypeEnum, type CommentEntity } from "types";

export interface CommentDocument
	extends Document,
		Omit<CommentEntity, "author"> {
	_id: ObjectId;
	author: ObjectId;
}

export const commentSchema = new Schema<CommentDocument>({
	author: {
		ref: USER,
		type: Schema.Types.ObjectId,
		required: true
	},
	downvote: {
		type: Number,
		required: true,
		default: 0
	},
	upvote: {
		type: Number,
		required: true,
		default: 0
	},
	text: {
		type: String,
		required: true
	},
	createdAt: {
		default: Date.now,
		type: Date
	},
	updatedAt: {
		default: Date.now,
		type: Date
	},
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: COMMENT
		}
	],
	commentType: {
		type: String,
		required: true,
		default: commentTypeEnum.COMMENT
	}
});

commentSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function (next) {
		await Comment.deleteMany({ _id: { $in: this.comments } });

		next();
	}
);

const Comment = mongoose.model<CommentDocument>(COMMENT, commentSchema);
export default Comment;
