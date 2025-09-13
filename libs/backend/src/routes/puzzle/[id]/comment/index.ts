import Comment from "@/models/comment/comment.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import {
	CommentEntity,
	commentTypeEnum,
	createCommentSchema,
	isAuthenticatedInfo
} from "types";
import {
	handleAndSendError,
	sendUnauthorizedError
} from "@/helpers/error.helpers.js";

export default async function puzzleByIdCommentRoutes(
	fastify: FastifyInstance
) {
	fastify.post<{
		Params: ParamsId;
	}>(
		"/",
		{
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const parseResult = createCommentSchema.safeParse(request.body);
			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
			}

			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
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
				commentType: commentTypeEnum.PUZZLE,
				parentId: id
			};

			try {
				const newComment = new Comment(commentData);
				await newComment.save();

				await Puzzle.findByIdAndUpdate(
					id,
					{ $push: { comments: newComment._id } },
					{ new: true }
				);

				const comment = await Comment.findById(newComment.id).populate(
					"author"
				);

				return reply.status(201).send(comment);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
