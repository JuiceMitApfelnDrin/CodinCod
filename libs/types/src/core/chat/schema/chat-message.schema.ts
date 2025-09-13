import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { CHAT_MESSAGE_CONFIG } from "../config/chat-message.config.js";

export const chatMessageSchema = z.object({
	username: z.string(),
	message: z
		.string()
		.min(CHAT_MESSAGE_CONFIG.minChatMessageLength)
		.max(CHAT_MESSAGE_CONFIG.maxChatMessageLength),
	createdAt: acceptedDateSchema,
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export function isChatMessage(data: unknown): data is ChatMessage {
	return chatMessageSchema.safeParse(data).success;
}
