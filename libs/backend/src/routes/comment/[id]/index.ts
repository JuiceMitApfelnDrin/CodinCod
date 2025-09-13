import Comment from "@/models/comment/comment.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { FastifyInstance } from "fastify";
import {
	commentTypeEnum,
	httpResponseCodes,
	objectIdSchema,
	commentDtoSchema,
	commentErrorResponseSchema,
	deleteCommentSuccessResponseSchema,
	idParamSchema,
	type CommentErrorResponse,
	type DeleteCommentSuccessResponse
} from "types";
import {
	handleAndSendError,
	sendNotFoundError
} from "@/helpers/error.helpers.js";

export default async function commentByIdRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Params: { id: string };
		Reply: any | CommentErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get a specific comment by ID",
				tags: ["Comments"],
				params: idParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: commentDtoSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: commentErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: commentErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: commentErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
		const parseResult = objectIdSchema.safeParse(request.params.id);

		if (!parseResult.success) {
			return handleAndSendError(reply, parseResult.error, request.url);
		}

		try {
			const comment = await Comment.findById(request.params.id)
				.populate("author")
				.populate("comments")
				.populate({
					path: "comments",
					populate: {
						path: "author"
					}
				});

			if (!comment) {
				return sendNotFoundError(reply, "Comment not found");
			}

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(comment);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	});

	fastify.delete<{
		Params: { id: string };
		Reply: DeleteCommentSuccessResponse | CommentErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Delete a specific comment",
				tags: ["Comments"],
				security: [{ bearerAuth: [] }],
				params: idParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: deleteCommentSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: commentErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: commentErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.FORBIDDEN]: commentErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: commentErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: commentErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			try {
				const comment = await Comment.findById(request.params.id);

				if (!comment) {
					return sendNotFoundError(reply, "Comment not found");
				}

				if (comment.commentType === commentTypeEnum.COMMENT) {
					await Comment.findOneAndUpdate(
						{ comments: comment._id },
						// Remove the comment._id from the comments array
						{ $pull: { comments: comment._id } },
						{ new: true }
					);
				} else {
					await Puzzle.findOneAndUpdate(
						{ comments: comment._id },
						{ $pull: { comments: comment._id } },
						{ new: true }
					);
				}

				await comment.deleteOne();

				return reply.status(204).send();
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
