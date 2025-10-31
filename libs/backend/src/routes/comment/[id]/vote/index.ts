import Comment from "@/models/comment/comment.js";
import UserVote from "@/models/user/user-vote.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { validateBody } from "@/plugins/middleware/validate-body.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import {
	CommentVoteRequest,
	commentVoteRequestSchema,
	httpResponseCodes,
	isAuthenticatedInfo,
	voteTypeEnum
} from "types";

export default async function commentByIdVoteRoutes(fastify: FastifyInstance) {
	fastify.post<ParamsId & { Body: CommentVoteRequest }>(
		"/",
		{
			onRequest: [authenticated, checkUserBan],
			preHandler: validateBody(commentVoteRequestSchema),
			config: {
				rateLimit: {
					max: 20,
					timeWindow: "1 minute"
				}
			}
		},
		async (request, reply) => {
			const { type } = request.body;

			// Ensure user is authenticated
			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const userId = request.user.userId;
			const commentId = request.params.id;

			try {
				const comment = await Comment.findById(commentId);

				if (!comment) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Comment not found" });
				}

				// Check if user already voted on this comment
				let existingVote = await UserVote.findOne({
					votedOn: commentId,
					author: userId
				});

				// Handle vote toggle/update
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

				// Extract counts from aggregation result
				const { upvote = 0, downvote = 0 } = voteCounts[0] || {};

				comment.upvote = upvote;
				comment.downvote = downvote;

				await comment.save();

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(comment);
			} catch (error) {
				fastify.log.error(error);
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Internal server error" });
			}
		}
	);
}
