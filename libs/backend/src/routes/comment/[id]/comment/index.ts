import Comment from "@/models/comment/comment.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import {
	CommentEntity,
	commentTypeEnum,
	createCommentSchema,
	httpResponseCodes,
	isAuthenticatedInfo
} from "types";

export default async function commentByIdCommentRoutes(
	fastify: FastifyInstance
) {
	fastify.post<ParamsId>(
		"/",
		{
			onRequest: [authenticated, checkUserBan]
		},
		async (request, reply) => {
			const parseResult = createCommentSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.issues });
			}

			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const id = request.params.id;
			const user = request.user;
			const userId = user.userId;

			const newCommentData: CommentEntity = {
				...parseResult.data,
				author: userId,
				upvote: 0,
				downvote: 0,
				comments: [],
				commentType: commentTypeEnum.COMMENT,
				parentId: id
			};
			try {
				const newComment = new Comment(newCommentData);
				await newComment.save();

				await Comment.findByIdAndUpdate(
					id,
					{ $push: { comments: newComment._id } },
					{ new: true }
				);

				const comment = await Comment.findById(newComment.id).populate(
					"author"
				);

				return reply.status(httpResponseCodes.SUCCESSFUL.CREATED).send(comment);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to create comment" });
			}
		}
	);
}
