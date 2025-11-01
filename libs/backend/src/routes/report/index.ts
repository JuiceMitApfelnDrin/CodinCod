import { FastifyInstance } from "fastify";
import {
	createReportSchema,
	httpResponseCodes,
	isAuthenticatedInfo,
	ReportEntity,
	reviewStatusEnum,
	ProblemTypeEnum
} from "types";
import Report from "../../models/report/report.js";
import authenticated from "../../plugins/middleware/authenticated.js";
import checkUserBan from "../../plugins/middleware/check-user-ban.js";
import ChatMessage from "../../models/chat/chat-message.js";

export default async function reportRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/",
		{
			onRequest: [authenticated, checkUserBan]
		},
		async (request, reply) => {
			const parseResult = createReportSchema.safeParse(request.body);

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

			if (parseResult.data.problemType === ProblemTypeEnum.GAME_CHAT) {
				const chatMessage = await ChatMessage.findById(
					parseResult.data.problematicIdentifier
				);

				if (!chatMessage) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Chat message not found" });
				}
			}

			const newReportData: Omit<ReportEntity, "createdAt" | "updatedAt"> = {
				...parseResult.data,
				reportedBy: userId,
				status: reviewStatusEnum.PENDING
			};

			try {
				const newReport = new Report(newReportData);
				await newReport.save();

				return reply
					.status(httpResponseCodes.SUCCESSFUL.CREATED)
					.send(newReport);
			} catch (error) {
				fastify.log.error(error, "Failed to create report");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to create report" });
			}
		}
	);
}
