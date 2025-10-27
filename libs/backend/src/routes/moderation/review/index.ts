import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	reviewItemTypeEnum,
	reviewStatusEnum,
	puzzleVisibilityEnum,
	ReviewItem,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	BAN_CONFIG,
	ProblemTypeEnum
} from "types";
import moderatorOnly from "../../../plugins/middleware/moderator-only.js";
import Puzzle from "../../../models/puzzle/puzzle.js";
import Report from "../../../models/report/report.js";
import ChatMessage from "../../../models/chat/chat-message.js";

export default async function moderationReviewRoutes(fastify: FastifyInstance) {
	// Get review items (pending puzzles or reports)
	fastify.get(
		"/",
		{
			onRequest: moderatorOnly
		},
		async (request, reply) => {
			const query = request.query as {
				type?: string;
				page?: string;
				limit?: string;
			};

			const type = query.type || reviewItemTypeEnum.PENDING_PUZZLE;
			const page = Number.parseInt(query.page || String(DEFAULT_PAGE), 10);
			const limit = Number.parseInt(
				query.limit || String(DEFAULT_PAGE_SIZE),
				10
			);
			const skip = (page - 1) * limit;

			try {
				let items: ReviewItem[] = [];
				let total = 0;

				if (type === reviewItemTypeEnum.PENDING_PUZZLE) {
					// Get puzzles that are ready for review
					const puzzles = await Puzzle.find({
						visibility: puzzleVisibilityEnum.READY
					})
						.populate("author", "username")
						.sort({ createdAt: -1 })
						.skip(skip)
						.limit(limit);

					total = await Puzzle.countDocuments({
						visibility: puzzleVisibilityEnum.READY
					});

					items = puzzles.map((puzzle: any) => ({
						id: puzzle._id.toString(),
						type: reviewItemTypeEnum.PENDING_PUZZLE,
						title: puzzle.title,
						description: puzzle.statement,
						createdAt: puzzle.createdAt || new Date(),
						authorName:
							typeof puzzle.author === "object" &&
							puzzle.author &&
							"username" in puzzle.author
								? String(puzzle.author.username)
								: undefined
					}));
				} else {
					// Get reports filtered by type
					const filter: any = { status: reviewStatusEnum.PENDING };

					if (type === reviewItemTypeEnum.REPORTED_PUZZLE) {
						filter.problemType = ProblemTypeEnum.PUZZLE;
					} else if (type === reviewItemTypeEnum.REPORTED_USER) {
						filter.problemType = ProblemTypeEnum.USER;
					} else if (type === reviewItemTypeEnum.REPORTED_COMMENT) {
						filter.problemType = ProblemTypeEnum.COMMENT;
					} else if (type === reviewItemTypeEnum.REPORTED_GAME_CHAT) {
						filter.problemType = ProblemTypeEnum.GAME_CHAT;
					}

					const reports = await Report.find(filter)
						.populate("reportedBy", "username")
						.populate("problematicIdentifier")
						.sort({ createdAt: -1 })
						.skip(skip)
						.limit(limit);

					total = await Report.countDocuments(filter);

					items = await Promise.all(
						reports.map(async (report: any) => {
							let title = "Unknown";
							let description = "";
							let gameId;
							let contextMessages;

							// Get title based on problem type
							if (report.problemType === ProblemTypeEnum.PUZZLE) {
								const puzzle = report.problematicIdentifier;
								title = puzzle?.title || "Deleted Puzzle";
								description = puzzle?.statement || "";
							} else if (report.problemType === ProblemTypeEnum.USER) {
								const user = report.problematicIdentifier;
								title = user?.username || "Deleted User";
							} else if (report.problemType === ProblemTypeEnum.COMMENT) {
								const comment = report.problematicIdentifier;
								title = `Comment: ${comment?.text?.substring(0, 50) || "Deleted Comment"}`;
								description = comment?.text || "";
							} else if (report.problemType === ProblemTypeEnum.GAME_CHAT) {
								const chatMessage = report.problematicIdentifier;
								title = `Chat from ${chatMessage?.username || "Unknown"}`;
								description = chatMessage?.message || "Deleted Message";
								gameId = chatMessage?.gameId;

								// Get context messages (5 before and 5 after)
								if (chatMessage && chatMessage.gameId) {
									const allMessages = await ChatMessage.find({
										gameId: chatMessage.gameId
									})
										.sort({ createdAt: 1 })
										.exec();

									const reportedIndex = allMessages.findIndex(
										(msg) =>
											String(msg._id) ===
											report.problematicIdentifier.toString()
									);

									if (reportedIndex !== -1) {
										const startIndex = Math.max(
											0,
											reportedIndex -
												BAN_CONFIG.chatRetention.CONTEXT_MESSAGES_BEFORE
										);
										const endIndex = Math.min(
											allMessages.length,
											reportedIndex +
												BAN_CONFIG.chatRetention.CONTEXT_MESSAGES_AFTER +
												1
										);

										contextMessages = allMessages
											.slice(startIndex, endIndex)
											.map((msg) => ({
												_id: msg._id,
												username: msg.username,
												message: msg.message,
												createdAt: msg.createdAt,
												isReported:
													String(msg._id) ===
													report.problematicIdentifier.toString()
											}));
									}
								}
							}

							return {
								id: report._id.toString(),
								type: type as (typeof reviewItemTypeEnum)[keyof typeof reviewItemTypeEnum],
								title,
								description,
								createdAt: report.createdAt || new Date(),
								reportExplanation: report.explanation,
								reportedBy:
									typeof report.reportedBy === "object" &&
									report.reportedBy &&
									"username" in report.reportedBy
										? String(report.reportedBy.username)
										: undefined,
								gameId,
								contextMessages
							};
						})
					);
				}

				const response = {
					data: items,
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit)
					}
				};

				return reply.send(response);
			} catch (error) {
				fastify.log.error(error, "Failed to fetch review items");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch review items" });
			}
		}
	);
}
