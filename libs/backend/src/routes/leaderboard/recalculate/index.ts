import { ERROR_MESSAGES, httpResponseCodes } from "types";
import { FastifyInstance } from "fastify";
import authenticated from "@/plugins/middleware/authenticated.js";
import moderatorOnly from "@/plugins/middleware/moderator-only.js";
import { leaderboardService } from "@/services/leaderboard.service.js";

export default async function recalculateLeaderboardRoutes(
	fastify: FastifyInstance
) {
	fastify.post(
		"/",
		{
			onRequest: [authenticated, moderatorOnly]
		},
		async (request, reply) => {
			try {
				const result = await leaderboardService.recalculateAllLeaderboards();

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
					message: `Successfully recalculated leaderboards`,
					processed: result
				});
			} catch (error) {
				fastify.log.error(error, "Failed to recalculate leaderboards");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({
						error: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
						message: ERROR_MESSAGES.GENERIC.SOMETHING_WENT_WRONG
					});
			}
		}
	);
}
