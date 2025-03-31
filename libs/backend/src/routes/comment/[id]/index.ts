import Comment from "@/models/comment/comment.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import { commentTypeEnum, httpResponseCodes, objectIdSchema } from "types";

export default async function commentByIdRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>("/", async (request, reply) => {
		const parseResult = objectIdSchema.safeParse(request.params.id);

		if (!parseResult.success) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ error: parseResult.error.errors });
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
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "Comment not found" });
			}

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(comment);
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Failed to fetch comment" });
		}
	});

	fastify.delete<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			try {
				const comment = await Comment.findById(request.params.id);

				if (!comment) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Comment not found" });
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

				return reply.status(httpResponseCodes.SUCCESSFUL.NO_CONTENT).send(comment);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch comment" });
			}
		}
	);
}
