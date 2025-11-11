/**
 * Game Channel Event Payload Schemas
 *
 * Zod schemas for validating WebSocket event payloads.
 * Provides runtime type safety and TypeScript type inference.
 */

import { z } from "zod";

/**
 * Client → Server: Code update event
 */
export const codeUpdatePayloadSchema = z.object({
	code: z.string(),
	language: z.string()
});

export type CodeUpdatePayload = z.infer<typeof codeUpdatePayloadSchema>;

/**
 * Client → Server: Submission result event
 */
export const submissionResultPayloadSchema = z.object({
	status: z.string(),
	executionTime: z.number().optional(),
	submissionId: z.string().optional()
});

export type SubmissionResultPayload = z.infer<
	typeof submissionResultPayloadSchema
>;

/**
 * Client → Server: Chat message event
 */
export const chatMessagePayloadSchema = z.object({
	message: z.string().min(1).max(500)
});

export type ChatMessagePayload = z.infer<typeof chatMessagePayloadSchema>;

/**
 * Client → Server: Typing indicator event
 */
export const typingPayloadSchema = z.object({
	isTyping: z.boolean()
});

export type TypingPayload = z.infer<typeof typingPayloadSchema>;

/**
 * Server → Client: Player online event
 */
export const playerOnlinePayloadSchema = z.object({
	userId: z.string(),
	username: z.string(),
	timestamp: z.iso.datetime()
});

export type PlayerOnlinePayload = z.infer<typeof playerOnlinePayloadSchema>;

/**
 * Server → Client: Player code updated event
 */
export const playerCodeUpdatedPayloadSchema = z.object({
	userId: z.string(),
	username: z.string(),
	code: z.string(),
	language: z.string(),
	timestamp: z.iso.datetime()
});

export type PlayerCodeUpdatedPayload = z.infer<
	typeof playerCodeUpdatedPayloadSchema
>;

/**
 * Server → Client: Player submitted event
 */
export const playerSubmittedPayloadSchema = z.object({
	userId: z.string(),
	username: z.string(),
	status: z.string(),
	executionTime: z.number().optional(),
	timestamp: z.iso.datetime()
});

export type PlayerSubmittedPayload = z.infer<
	typeof playerSubmittedPayloadSchema
>;

/**
 * Server → Client: Player ready event
 */
export const playerReadyPayloadSchema = z.object({
	userId: z.string(),
	username: z.string(),
	timestamp: z.iso.datetime()
});

export type PlayerReadyPayload = z.infer<typeof playerReadyPayloadSchema>;

/**
 * Server → Client: Chat message received event
 */
export const chatMessageReceivedPayloadSchema = z.object({
	userId: z.string(),
	username: z.string(),
	message: z.string(),
	timestamp: z.iso.datetime()
});

export type ChatMessageReceivedPayload = z.infer<
	typeof chatMessageReceivedPayloadSchema
>;

/**
 * Server → Client: Player typing event
 */
export const playerTypingPayloadSchema = z.object({
	userId: z.string(),
	username: z.string(),
	isTyping: z.boolean()
});

export type PlayerTypingPayload = z.infer<typeof playerTypingPayloadSchema>;

/**
 * Server → Client: Game state updated event
 */
export const gameStateUpdatedPayloadSchema = z.object({
	status: z.string(),
	timestamp: z.iso.datetime()
});

export type GameStateUpdatedPayload = z.infer<
	typeof gameStateUpdatedPayloadSchema
>;

/**
 * Validator function type
 */
export type PayloadValidator<T> = (data: unknown) => data is T;

/**
 * Create a type-safe validator from a Zod schema
 */
export function createValidator<T>(schema: z.ZodType<T>): PayloadValidator<T> {
	return (data: unknown): data is T => {
		const result = schema.safeParse(data);
		return result.success;
	};
}

/**
 * Validators for each event type
 */
export const validators = {
	codeUpdate: createValidator(codeUpdatePayloadSchema),
	submissionResult: createValidator(submissionResultPayloadSchema),
	chatMessage: createValidator(chatMessagePayloadSchema),
	typing: createValidator(typingPayloadSchema),
	playerOnline: createValidator(playerOnlinePayloadSchema),
	playerCodeUpdated: createValidator(playerCodeUpdatedPayloadSchema),
	playerSubmitted: createValidator(playerSubmittedPayloadSchema),
	playerReady: createValidator(playerReadyPayloadSchema),
	chatMessageReceived: createValidator(chatMessageReceivedPayloadSchema),
	playerTyping: createValidator(playerTypingPayloadSchema),
	gameStateUpdated: createValidator(gameStateUpdatedPayloadSchema)
} as const;
