import { FastifyInstance } from "fastify";
import { httpResponseCodes } from "types";
import { gameService } from "@/services/game.service.js";
import { gameModeService } from "@/services/game-mode.service.js";
import Submission from "@/models/submission/submission.js";

/**
 * Game leaderboard and statistics routes
 */
export default async function gameLeaderboardRoutes(fastify: FastifyInstance) {
	/**
	 * GET /game/:id/leaderboard - Get ranked leaderboard for a game
	 */
	fastify.get<{ Params: { id: string } }>(
		"/:id/leaderboard",
		async (request, reply) => {
			try {
				const { id } = request.params;

				const game = await gameService.findByIdPopulated(id);

				if (!game) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: `Game with id ${id} not found` });
				}

				// Fetch all submissions for this game
				const submissionIds = (game.playerSubmissions ?? []).map((sub) =>
					typeof sub === "string" ? sub : sub._id
				);

				const submissions = await Submission.find({
					_id: { $in: submissionIds }
				})
					.populate("user")
					.populate("programmingLanguage")
					.exec();

				// Build leaderboard using game mode service
				const leaderboard = gameModeService.getGameLeaderboard(
					game,
					submissions as any
				);

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
					gameId: id,
					mode: game.options?.mode,
					leaderboard,
					totalPlayers: leaderboard.length
				});
			} catch (error) {
				fastify.log.error(error, "Error fetching game leaderboard");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch leaderboard" });
			}
		}
	);

	/**
	 * GET /game/:id/stats - Get game statistics
	 */
	fastify.get<{ Params: { id: string } }>(
		"/:id/stats",
		async (request, reply) => {
			try {
				const { id } = request.params;

				const game = await gameService.findByIdPopulated(id);

				if (!game) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: `Game with id ${id} not found` });
				}

				const mode = game.options?.mode;
				const displayMetrics = mode
					? gameModeService.getDisplayMetricsForMode(mode)
					: ["score", "time"];

				const description = mode
					? gameModeService.getGameModeDescription(mode)
					: "Standard game";

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
					gameId: id,
					mode,
					description,
					displayMetrics,
					playerCount: game.players?.length ?? 0,
					submissionCount: game.playerSubmissions?.length ?? 0,
					createdAt: game.createdAt,
					options: game.options
				});
			} catch (error) {
				fastify.log.error(error, "Error fetching game stats");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch game statistics" });
			}
		}
	);
}
