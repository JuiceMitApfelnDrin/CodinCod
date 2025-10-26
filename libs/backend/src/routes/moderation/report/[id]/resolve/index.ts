import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	isAuthenticatedInfo,
	resolveReportSchema,
	reviewStatusEnum,
	ProblemTypeEnum
} from "types";
import mongoose from "mongoose";
import moderatorOnly from "../../../../../plugins/middleware/moderator-only.js";
import Report from "../../../../../models/report/report.js";
import { ParamsId } from "../../../../../types/types.js";
import {
	incrementReportCount,
	applyAutomaticEscalation
} from "../../../../../utils/moderation/escalation.js";
import Comment from "../../../../../models/comment/comment.js";
import Puzzle from "../../../../../models/puzzle/puzzle.js";
import ChatMessage from "../../../../../models/chat/chat-message.js";

export default async function moderationReportByIdResolveRoutes(
	fastify: FastifyInstance
) {
	fastify.post<ParamsId>(
		"/",
		{
			onRequest: moderatorOnly
		},
		async (request, reply) => {
			const { id } = request.params;

			const parseResult = resolveReportSchema.safeParse(request.body);
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

			const userId = request.user.userId;

			try {
				const report = await Report.findById(id);

				if (!report) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Report not found" });
				}

				// Update report status
				report.status = parseResult.data.status;
				report.resolvedBy = new mongoose.Types.ObjectId(userId);
				report.updatedAt = new Date();
				await report.save();

				// If report is resolved, increment user's report count and check for escalation
				if (parseResult.data.status === reviewStatusEnum.RESOLVED) {
					try {
						// Find the reported entity to get the user ID
						let reportedUserId = null;

						if (report.problemType === ProblemTypeEnum.USER) {
							reportedUserId = report.problematicIdentifier;
						} else {
							// For other types, we need to find the author/owner directly
							// This could be a puzzle author, comment author, or chat message sender
							// We'll query the specific model based on problem type
							if (report.problemType === ProblemTypeEnum.PUZZLE) {
								
								const puzzle = await Puzzle.findById(
									report.problematicIdentifier
								);
								reportedUserId = puzzle?.author;
							} else if (report.problemType === ProblemTypeEnum.COMMENT) {
								
								const comment = await Comment.findById(
									report.problematicIdentifier
								);
								reportedUserId = comment?.author;
							} else if (report.problemType === ProblemTypeEnum.GAME_CHAT) {
								
								const message = await ChatMessage.findById(
									report.problematicIdentifier
								);
								reportedUserId = message?.userId;
							}
						}

						if (reportedUserId) {
							// Increment report count
							const reportCount = await incrementReportCount(
								reportedUserId.toString()
							);

							// Apply automatic escalation if needed
							const ban = await applyAutomaticEscalation(
								reportedUserId.toString(),
								userId,
								report.explanation
							);

							if (ban) {
								fastify.log.info(
									{
										userId: reportedUserId,
										reportCount,
										banType: ban.banType
									},
									"Automatic ban applied"
								);
							}
						}
					} catch (escalationError) {
						fastify.log.error(
							escalationError,
							"Failed to apply escalation, but report was resolved"
						);
					}
				}

				return reply.send({
					message: "Report resolved successfully",
					report
				});
			} catch (error) {
				fastify.log.error(error, "Failed to resolve report");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to resolve report" });
			}
		}
	);
}
