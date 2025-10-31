import { z } from "zod";
import { messageSchema } from "../../common/schema/message.schema.js";
import { paginatedQueryResponseSchema } from "../../common/schema/paginated-query-response.schema.js";
import { paginatedQuerySchema } from "../../common/schema/paginated-query.schema.js";
import { reviewItemSchema } from "../../moderation/schema/review-item.schema.js";
import {
	approvePuzzleSchema,
	revisePuzzleSchema,
} from "../../moderation/schema/puzzle-moderation.schema.js";
import { reportEntitySchema } from "../../moderation/schema/report.schema.js";
import { userBanEntitySchema } from "../../moderation/schema/user-ban.schema.js";

// GET /moderation/review query params
export const getModerationReviewQuerySchema = paginatedQuerySchema;
export type GetModerationReviewQuery = z.infer<
	typeof getModerationReviewQuerySchema
>;

// GET /moderation/review response
export const getModerationReviewResponseSchema =
	paginatedQueryResponseSchema.extend({
		items: z.array(reviewItemSchema),
	});
export type GetModerationReviewResponse = z.infer<
	typeof getModerationReviewResponseSchema
>;

// POST /moderation/puzzle/:id/approve request
export const approvePuzzleRequestSchema = approvePuzzleSchema;
export type ApprovePuzzleRequest = z.infer<typeof approvePuzzleRequestSchema>;

// POST /moderation/puzzle/:id/approve response
export const approvePuzzleResponseSchema = z.object({
	message: messageSchema,
});
export type ApprovePuzzleResponse = z.infer<typeof approvePuzzleResponseSchema>;

// POST /moderation/puzzle/:id/revise request
export const revisePuzzleRequestSchema = revisePuzzleSchema;
export type RevisePuzzleRequest = z.infer<typeof revisePuzzleRequestSchema>;

// POST /moderation/puzzle/:id/revise response
export const revisePuzzleResponseSchema = z.object({
	message: messageSchema,
});
export type RevisePuzzleResponse = z.infer<typeof revisePuzzleResponseSchema>;

// POST /moderation/report/:id/resolve request
export const resolveReportRequestSchema = z.object({
	action: z.enum(["accept", "reject"]),
	notes: z.string().optional(),
});
export type ResolveReportRequest = z.infer<typeof resolveReportRequestSchema>;

// POST /moderation/report/:id/resolve response
export const resolveReportResponseSchema = z.object({
	message: messageSchema,
});
export type ResolveReportResponse = z.infer<typeof resolveReportResponseSchema>;

// POST /moderation/user/:id/ban/:type request
export const banUserRequestSchema = z.object({
	reason: z.string().min(10, "Reason must be at least 10 characters"),
	duration: z.number().positive().optional(), // Duration in seconds, optional for permanent bans
});
export type BanUserRequest = z.infer<typeof banUserRequestSchema>;

// POST /moderation/user/:id/ban/:type response
export const banUserResponseSchema = z.object({
	message: messageSchema,
	ban: userBanEntitySchema,
});
export type BanUserResponse = z.infer<typeof banUserResponseSchema>;

// GET /moderation/user/:id/ban/history response
export const getBanHistoryResponseSchema = z.object({
	bans: z.array(userBanEntitySchema),
});
export type GetBanHistoryResponse = z.infer<typeof getBanHistoryResponseSchema>;

// POST /moderation/user/:id/unban response
export const unbanUserResponseSchema = z.object({
	message: messageSchema,
});
export type UnbanUserResponse = z.infer<typeof unbanUserResponseSchema>;

// POST /report request
export const createReportRequestSchema = reportEntitySchema.omit({
	createdAt: true,
	updatedAt: true,
	status: true,
	resolvedBy: true,
});
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

// POST /report response
export const createReportResponseSchema = z.object({
	message: messageSchema,
	report: reportEntitySchema,
});
export type CreateReportResponse = z.infer<typeof createReportResponseSchema>;
