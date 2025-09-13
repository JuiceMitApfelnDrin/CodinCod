import Comment from "@/models/comment/comment.js";
import UserVote from "@/models/user/user-vote.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import {
	commentVoteRequestSchema,
	httpResponseCodes,
	isAuthenticatedInfo,
	voteTypeEnum
} from "types";
import {
	handleAndSendError,
	sendUnauthorizedError,
	sendNotFoundError
} from "@/helpers/error.helpers.js";

export default async function commentByIdVoteRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Params: ParamsId;
	}>(
		"/",
		{
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const parsed = commentVoteRequestSchema.safeParse(request.body);

			if (!parsed.success) {
				return handleAndSendError(reply, parsed.error, request.url);
			}
			const { type } = parsed.data;

			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const userId = request.user.userId;
			const commentId = request.params.id;

			try {
				const comment = await Comment.findById(commentId);

				if (!comment) {
					return sendNotFoundError(reply, "Comment not found");
				}

				let existingVote = await UserVote.findOne({
					votedOn: commentId,
					author: userId
				});

				if (existingVote && existingVote.type === type) {
					await existingVote.deleteOne();
				} else if (existingVote) {
					existingVote.type = type;
					await existingVote.save();
				} else {
					await UserVote.create({
						type,
						votedOn: commentId,
						author: userId,
						createdAt: new Date()
					});
				}

				const voteCounts = await UserVote.aggregate([
					{
						$match: { votedOn: commentId }
					},
					{
						$group: {
							_id: null,
							upvote: {
								$sum: {
									$cond: [{ $eq: ["$type", voteTypeEnum.UPVOTE] }, 1, 0]
								}
							},
							downvote: {
								$sum: {
									$cond: [{ $eq: ["$type", voteTypeEnum.DOWNVOTE] }, 1, 0]
								}
							}
						}
					}
				]);

				const { upvote = 0, downvote = 0 } = voteCounts[0] || {};

				comment.upvote = upvote;
				comment.downvote = downvote;

				await comment.save();

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(comment);
			} catch (error) {
				fastify.log.error(error);
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
