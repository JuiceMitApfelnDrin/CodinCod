import { z } from "zod";
import { commentDtoSchema } from "../../comment/schema/comment-dto.schema.js";
import { createCommentSchema } from "../../comment/schema/create-comment.schema.js";
import { messageSchema } from "../../common/schema/message.schema.js";
import { paginatedQueryResponseSchema } from "../../common/schema/paginated-query-response.schema.js";
import { paginatedQuerySchema } from "../../common/schema/paginated-query.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { solutionSchema } from "../../puzzle/schema/solution.schema.js";

// GET /puzzle query params
export const getPuzzlesQuerySchema = paginatedQuerySchema;
export type GetPuzzlesQuery = z.infer<typeof getPuzzlesQuerySchema>;

// GET /puzzle response
export const getPuzzlesResponseSchema = paginatedQueryResponseSchema.extend({
	items: z.array(puzzleDtoSchema)
});
export type GetPuzzlesResponse = z.infer<typeof getPuzzlesResponseSchema>;

// GET /puzzle/:id response
export const getPuzzleByIdResponseSchema = puzzleDtoSchema;
export type GetPuzzleByIdResponse = z.infer<typeof getPuzzleByIdResponseSchema>;

// POST /puzzle/:id/comment request
export const createPuzzleCommentRequestSchema = createCommentSchema;
export type CreatePuzzleCommentRequest = z.infer<
	typeof createPuzzleCommentRequestSchema
>;

// POST /puzzle/:id/comment response
export const createPuzzleCommentResponseSchema = commentDtoSchema;
export type CreatePuzzleCommentResponse = z.infer<
	typeof createPuzzleCommentResponseSchema
>;

// GET /puzzle/:id/comment query params
export const getPuzzleCommentsQuerySchema = paginatedQuerySchema;
export type GetPuzzleCommentsQuery = z.infer<
	typeof getPuzzleCommentsQuerySchema
>;

// GET /puzzle/:id/comment response
export const getPuzzleCommentsResponseSchema =
	paginatedQueryResponseSchema.extend({
		items: z.array(commentDtoSchema)
	});
export type GetPuzzleCommentsResponse = z.infer<
	typeof getPuzzleCommentsResponseSchema
>;

// GET /puzzle/:id/solution response
export const getPuzzleSolutionResponseSchema = z.object({
	solutions: z.array(solutionSchema)
});
export type GetPuzzleSolutionResponse = z.infer<
	typeof getPuzzleSolutionResponseSchema
>;

// DELETE /puzzle/:id response
export const deletePuzzleResponseSchema = z.object({
	message: messageSchema
});
export type DeletePuzzleResponse = z.infer<typeof deletePuzzleResponseSchema>;
