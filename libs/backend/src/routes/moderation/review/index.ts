import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	reviewItemTypeEnum,
	reviewStatusEnum,
	puzzleVisibilityEnum,
	ReviewItem,
	DEFAULT_PAGE
} from "types";
import moderatorOnly from "../../../plugins/middleware/moderator-only.js";
import Puzzle from "../../../models/puzzle/puzzle.js";
import Report from "../../../models/report/report.js";

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
			const limit = Number.parseInt(query.limit || "20", 10);
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
						filter.problemType = "puzzle";
					} else if (type === reviewItemTypeEnum.REPORTED_USER) {
						filter.problemType = "user";
					} else if (type === reviewItemTypeEnum.REPORTED_COMMENT) {
						filter.problemType = "comment";
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

							// Get title based on problem type
							if (report.problemType === "puzzle") {
								const puzzle = report.problematicIdentifier as any;
								title = puzzle?.title || "Deleted Puzzle";
								description = puzzle?.statement || "";
							} else if (report.problemType === "user") {
								const user = report.problematicIdentifier as any;
								title = user?.username || "Deleted User";
							} else if (report.problemType === "comment") {
								const comment = report.problematicIdentifier as any;
								title = `Comment: ${comment?.text?.substring(0, 50) || "Deleted Comment"}`;
								description = comment?.text || "";
							}

							return {
								id: report._id.toString(),
								type: type as any,
								title,
								description,
								createdAt: report.createdAt || new Date(),
								reportExplanation: report.explanation,
								reportedBy:
									typeof report.reportedBy === "object" &&
									report.reportedBy &&
									"username" in report.reportedBy
										? String(report.reportedBy.username)
										: undefined
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
