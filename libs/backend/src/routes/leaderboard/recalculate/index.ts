import { genericReturnMessages } from "@/config/generic-return-messages.js";
import { leaderboardService } from "@/services/leaderboard.service.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes } from "types";

export default async function leaderboardRecalculateRoutes(
	fastify: FastifyInstance
) {
	fastify.post("/", async (request, reply) => {
		const { OK } = httpResponseCodes.SUCCESSFUL;
		const { INTERNAL_SERVER_ERROR } = httpResponseCodes.SERVER_ERROR;

		try {
			request.log.info("Manual leaderboard recalculation triggered");

			const results = await leaderboardService.recalculateAllLeaderboards();

			return reply.status(OK).send({
				success: true,
				message: "Leaderboard recalculation completed",
				processedGames: results.processedGames,
				totalProcessed: results.totalProcessed
			});
		} catch (error) {
			request.log.error({ err: error }, "Error during manual recalculation");
			const { WENT_WRONG } = genericReturnMessages[INTERNAL_SERVER_ERROR];
			return reply.status(INTERNAL_SERVER_ERROR).send({
				error: `Leaderboard recalculation ${WENT_WRONG}`
			});
		}
	});
}
