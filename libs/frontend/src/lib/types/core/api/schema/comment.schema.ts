import { z } from "zod";
import { commentDtoSchema } from "../../comment/schema/comment-dto.schema.js";
import { createCommentSchema } from "../../comment/schema/create-comment.schema.js";
import { commentVoteRequestSchema } from "../../comment/schema/comment-vote.schema.js";
import { messageSchema } from "../../common/schema/message.schema.js";

// GET /comment/:id response
export const getCommentByIdResponseSchema = commentDtoSchema;
export type GetCommentByIdResponse = z.infer<
	typeof getCommentByIdResponseSchema
>;

// DELETE /comment/:id response
export const deleteCommentResponseSchema = z.object({
	message: messageSchema,
});
export type DeleteCommentResponse = z.infer<typeof deleteCommentResponseSchema>;

// POST /comment/:id/comment request
export const createReplyCommentRequestSchema = createCommentSchema;
export type CreateReplyCommentRequest = z.infer<
	typeof createReplyCommentRequestSchema
>;

// POST /comment/:id/comment response
export const createReplyCommentResponseSchema = commentDtoSchema;
export type CreateReplyCommentResponse = z.infer<
	typeof createReplyCommentResponseSchema
>;

// POST /comment/:id/vote request
export const voteCommentRequestSchema = commentVoteRequestSchema;
export type VoteCommentRequest = z.infer<typeof voteCommentRequestSchema>;

// POST /comment/:id/vote response
export const voteCommentResponseSchema = z.object({
	message: messageSchema,
	voteCount: z.number(),
});
export type VoteCommentResponse = z.infer<typeof voteCommentResponseSchema>;
