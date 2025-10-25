import { FastifyInstance } from "fastify";
import {
	createReportSchema,
	httpResponseCodes,
	isAuthenticatedInfo,
	ReportEntity,
	reviewStatusEnum
} from "types";
import Report from "../../models/report/report.js";
import authenticated from "../../plugins/middleware/authenticated.js";

export default async function reportRoutes(fastify: FastifyInstance) {
	// Create a new report
	fastify.post(
		"/",
		{
			onRequest: authenticated
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
