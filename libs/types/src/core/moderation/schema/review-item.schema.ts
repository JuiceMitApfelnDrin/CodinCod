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
	]),
	title: z.string(),
	description: z.string().optional(),
	createdAt: acceptedDateSchema,
	// For reports: the explanation
	reportExplanation: z.string().optional(),
	// For reports: who reported it
	reportedBy: z.string().optional(),
	// For puzzles: author name
	authorName: z.string().optional(),
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
		])
		.optional(),
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().optional(),
});
export type ReviewItemQuery = z.infer<typeof reviewItemQuerySchema>;
