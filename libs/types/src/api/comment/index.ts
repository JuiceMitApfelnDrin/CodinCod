import { z } from "zod";
import { createCommentSchema } from "../../core/comment/schema/create-comment.schema.js";
import { commentEntitySchema } from "../../core/comment/schema/comment-entity.schema.js";
import { commentDtoSchema } from "../../core/comment/schema/comment-dto.schema.js";
import { objectIdSchema } from "../../core/common/schema/object-id.js";
import { paginatedQuerySchema } from "../../core/common/schema/paginated-query.schema.js";
import { paginatedQueryResponseSchema } from "../../core/common/schema/paginated-query-response.schema.js";

export const createCommentRequestSchema = z.object({
	puzzleId: objectIdSchema,
	comment: createCommentSchema,
});
export const createCommentSuccessResponseSchema = commentDtoSchema;

export const getCommentsRequestSchema = z
	.object({
		puzzleId: objectIdSchema,
	})
	.extend(paginatedQuerySchema.shape);
export const getCommentsSuccessResponseSchema =
	paginatedQueryResponseSchema.extend({
		data: z.array(commentDtoSchema),
	});

export const updateCommentRequestSchema = z.object({
	id: objectIdSchema,
	data: createCommentSchema.partial(),
});
export const updateCommentSuccessResponseSchema = commentEntitySchema;

export const deleteCommentRequestSchema = z.object({
	id: objectIdSchema,
});
export const deleteCommentSuccessResponseSchema = z.object({
	message: z.string(),
});

export const voteCommentRequestSchema = z.object({
	id: objectIdSchema,
	vote: z.object({
		type: z.enum(["upvote", "downvote", "none"]),
	}),
});
export const voteCommentSuccessResponseSchema = z.object({
	message: z.string(),
	newScore: z.number(),
});

export const commentErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;
export type CreateCommentSuccessResponse = z.infer<
	typeof createCommentSuccessResponseSchema
>;

export type GetCommentsRequest = z.infer<typeof getCommentsRequestSchema>;
export type GetCommentsSuccessResponse = z.infer<
	typeof getCommentsSuccessResponseSchema
>;

export type UpdateCommentRequest = z.infer<typeof updateCommentRequestSchema>;
export type UpdateCommentSuccessResponse = z.infer<
	typeof updateCommentSuccessResponseSchema
>;

export type DeleteCommentRequest = z.infer<typeof deleteCommentRequestSchema>;
export type DeleteCommentSuccessResponse = z.infer<
	typeof deleteCommentSuccessResponseSchema
>;

export type VoteCommentRequest = z.infer<typeof voteCommentRequestSchema>;
export type VoteCommentSuccessResponse = z.infer<
	typeof voteCommentSuccessResponseSchema
>;

export type CommentErrorResponse = z.infer<typeof commentErrorResponseSchema>;

export function isCreateCommentSuccessResponse(
	comment: any,
): comment is CreateCommentSuccessResponse {
	return createCommentSuccessResponseSchema.safeParse(comment).success;
}
