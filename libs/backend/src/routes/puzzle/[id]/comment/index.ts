import Comment from "@/models/comment/comment.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import {
	CommentEntity,
	commentTypeEnum,
	createCommentSchema,
	httpResponseCodes,
	isAuthenticatedInfo
} from "types";

export default async function puzzleByIdCommentRoutes(fastify: FastifyInstance) {
	fastify.post<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = createCommentSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.errors });
			}

			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const id = request.params.id;
			const user = request.user;
			const userId = user.userId;

			const commentData: CommentEntity = {
				...parseResult.data,
				author: userId,
				upvote: 0,
				downvote: 0,
				comments: [],
				commentType: commentTypeEnum.PUZZLE
			};

			try {
				const comment = new Comment(commentData);
				await comment.save();

				await Puzzle.findByIdAndUpdate(id, { $push: { comments: comment._id } }, { new: true });

				return reply.status(httpResponseCodes.SUCCESSFUL.CREATED).send(comment);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to create comment" });
			}
		}
	);
}
