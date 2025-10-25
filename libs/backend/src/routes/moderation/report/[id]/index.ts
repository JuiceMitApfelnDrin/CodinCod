import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	isAuthenticatedInfo,
	resolveReportSchema,
} from "types";
import mongoose from "mongoose";
import moderatorOnly from "../../../../plugins/middleware/moderator-only.js";
import Report from "../../../../models/report/report.js";
import { ParamsId } from "../../../../types/types.js";

export default async function moderationReportByIdRoutes(
	fastify: FastifyInstance
) {
	fastify.post<ParamsId>(
		"/resolve",
		{
			onRequest: moderatorOnly,
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
			await report.save();				return reply.send({
					message: "Report resolved successfully",
					report,
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
