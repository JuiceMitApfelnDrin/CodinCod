import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { ChatMessageEntity } from "types";
import { CHAT_MESSAGE, GAME, USER } from "../../utils/constants/model.js";

export interface ChatMessageDocument
	extends Document,
		Omit<ChatMessageEntity, "gameId" | "userId" | "_id"> {
	gameId: ObjectId;
	userId: ObjectId;
}

const chatMessageSchema = new Schema<ChatMessageDocument>({
	gameId: {
		type: Schema.Types.ObjectId,
		ref: GAME,
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: USER,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	isDeleted: {
		type: Boolean,
		default: false
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
chatMessageSchema.index({ gameId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1 });
chatMessageSchema.index({ createdAt: 1 });

const ChatMessage = mongoose.model<ChatMessageDocument>(
	CHAT_MESSAGE,
	chatMessageSchema
);

export default ChatMessage;
