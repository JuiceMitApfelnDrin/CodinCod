import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { CHAT_MESSAGE_CONFIG } from "../config/chat-message-config.js";

/**
 * Persistent chat message entity for database storage
 * Used for moderation and reporting purposes
 */
export const chatMessageEntitySchema = z.object({
	_id: objectIdSchema.optional(),
	gameId: objectIdSchema,
	userId: objectIdSchema,
	username: z.string(),
	message: z
		.string()
		.min(CHAT_MESSAGE_CONFIG.minChatMessageLength)
		.max(CHAT_MESSAGE_CONFIG.maxChatMessageLength),
	isDeleted: z.boolean().default(false),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
});

export type ChatMessageEntity = z.infer<typeof chatMessageEntitySchema>;

export function isChatMessageEntity(data: unknown): data is ChatMessageEntity {
	return chatMessageEntitySchema.safeParse(data).success;
}

/**
 * Schema for creating a new chat message
 */
export const createChatMessageSchema = chatMessageEntitySchema.pick({
	gameId: true,
	userId: true,
	username: true,
	message: true,
});

export type CreateChatMessage = z.infer<typeof createChatMessageSchema>;
