import { z } from "zod";
import { reviewItemTypeEnum } from "../enum/review-item-type-enum.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

/**
 * Unified review item that can represent different types of items needing moderation
 */
export const reviewItemSchema = z.object({
	id: objectIdSchema,
	type: z.enum([
		reviewItemTypeEnum.PENDING_PUZZLE,
		reviewItemTypeEnum.REPORTED_PUZZLE,
		reviewItemTypeEnum.REPORTED_USER,
		reviewItemTypeEnum.REPORTED_COMMENT,
		reviewItemTypeEnum.REPORTED_GAME_CHAT,
	]),
	title: z.string(),
	description: z.string().optional(),
	createdAt: acceptedDateSchema,
	// For reports: the explanation
	reportExplanation: z.string().optional(),
	// For reports: who reported it
	reportedBy: z.string().optional(),
	// For reports: the reported user ID
	reportedUserId: objectIdSchema.optional(),
	// For reports: the reported user name
	reportedUserName: z.string().optional(),
	// For reports: the reported message ID
	reportedMessageId: objectIdSchema.optional(),
	// For puzzles: author name
	authorName: z.string().optional(),
	// For game chat: game ID
	gameId: objectIdSchema.optional(),
	// For game chat: context messages
	contextMessages: z.array(z.any()).optional(),
});
export type ReviewItem = z.infer<typeof reviewItemSchema>;

/**
 * Query parameters for filtering review items
 */
export const reviewItemQuerySchema = z.object({
	type: z
		.enum([
			reviewItemTypeEnum.PENDING_PUZZLE,
			reviewItemTypeEnum.REPORTED_PUZZLE,
			reviewItemTypeEnum.REPORTED_USER,
			reviewItemTypeEnum.REPORTED_COMMENT,
			reviewItemTypeEnum.REPORTED_GAME_CHAT,
		])
		.optional(),
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().optional(),
});
export type ReviewItemQuery = z.infer<typeof reviewItemQuerySchema>;
