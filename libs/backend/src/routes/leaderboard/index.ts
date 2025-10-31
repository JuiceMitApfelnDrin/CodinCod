import { FastifyInstance } from "fastify";
import { httpResponseCodes, LeaderboardAPI, gameModeEnum } from "types";
import { leaderboardService } from "../../services/leaderboard.service.js";
import User from "../../models/user/user.js";

export default async function leaderboardRoutes(fastify: FastifyInstance) {
	/**
	 * GET /leaderboard/:gameMode - Get leaderboard for a specific game mode
	 */
	fastify.get<{
		Params: { gameMode: string };
		Querystring: { page?: string; pageSize?: string };
	}>("/:gameMode", async (request, reply) => {
		const { gameMode } = request.params;
		const page = parseInt(request.query.page || "1", 10);
		const pageSize = Math.min(
			parseInt(request.query.pageSize || "50", 10),
			100
		);

		// Validate game mode
		const validModes = Object.values(gameModeEnum);
		if (!validModes.includes(gameMode as any)) {
			return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
				error: `Invalid game mode. Valid modes: ${validModes.join(", ")}`
			});
		}

		try {
			const result = await leaderboardService.getLeaderboard(
				gameMode as any,
				page,
				pageSize
			);

			const response: LeaderboardAPI.GetLeaderboardResponse = {
				gameMode: gameMode as any,
				entries: result.entries,
				page,
				pageSize,
				totalEntries: result.total,
				totalPages: Math.ceil(result.total / pageSize),
				lastUpdated: result.lastUpdated.toISOString()
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(response);
		} catch (error) {
			request.log.error({ err: error }, "Error fetching leaderboard");
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({
					error: "Failed to fetch leaderboard"
				});
		}
	});

	/**
	 * GET /leaderboard/user/:userId - Get user's rankings across all game modes
	 */
	fastify.get<{ Params: { userId: string } }>(
		"/user/:userId",
		async (request, reply) => {
			const { userId } = request.params;

			try {
				// Verify user exists
				const user = await User.findById(userId);
				if (!user) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
						error: `User with id ${userId} not found`
					});
				}

				const rankings = await leaderboardService.getUserRankings(userId);

				const response: LeaderboardAPI.GetUserLeaderboardStatsResponse = {
					userId,
					username: user.username,
					rankings
				};

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(response);
			} catch (error) {
				request.log.error({ err: error }, "Error fetching user rankings");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({
						error: "Failed to fetch user rankings"
					});
			}
		}
	);

	/**
	 * POST /leaderboard/recalculate - Manually trigger leaderboard recalculation
	 * (Admin only - should add authentication middleware in production)
	 */
	fastify.post("/recalculate", async (request, reply) => {
		try {
			request.log.info("Manual leaderboard recalculation triggered");

			const results = await leaderboardService.recalculateAllLeaderboards();

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
				success: true,
				message: "Leaderboard recalculation completed",
				processedGames: results.processedGames,
				totalProcessed: results.totalProcessed
			});
		} catch (error) {
			request.log.error({ err: error }, "Error during manual recalculation");
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({
					error: "Failed to recalculate leaderboards"
				});
		}
	});
}
