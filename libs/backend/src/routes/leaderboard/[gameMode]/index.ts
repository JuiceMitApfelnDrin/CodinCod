import { genericReturnMessages } from "@/config/generic-return-messages.js";
import { leaderboardService } from "@/services/leaderboard.service.js";
import { FastifyInstance } from "fastify";
import {
	DEFAULT_PAGE,
	ERROR_MESSAGES,
	httpResponseCodes,
	isGameMode,
	LeaderboardAPI,
	PAGINATION_CONFIG
} from "types";

const LEADERBOARD = "Leaderboard";

export default async function leaderboardByGameModeRoutes(
	fastify: FastifyInstance
) {
	fastify.get<{
		Params: { gameMode: string };
		Querystring: { page?: string; pageSize?: string };
	}>("/", async (request, reply) => {
		const { gameMode } = request.params;

		const page = Math.max(
			parseInt(request.query.page || String(DEFAULT_PAGE), 10),
			PAGINATION_CONFIG.MIN_PAGE
		);
		const pageSize = Math.min(
			Math.max(
				parseInt(
					request.query.pageSize ||
						String(PAGINATION_CONFIG.DEFAULT_LIMIT_LEADERBOARD),
					10
				),
				PAGINATION_CONFIG.MIN_LIMIT
			),
			PAGINATION_CONFIG.MAX_LIMIT
		);

		if (!isGameMode(gameMode)) {
			return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
				error: `Game mode ${genericReturnMessages[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST].IS_INVALID}.`
			});
		}

		try {
			const result = await leaderboardService.getLeaderboard(
				gameMode,
				page,
				pageSize
			);

			const response: LeaderboardAPI.GetLeaderboardResponse = {
				gameMode: gameMode,
				entries: result.entries,
				page,
				pageSize,
				totalEntries: result.total,
				totalPages: Math.ceil(result.total / pageSize),
				lastUpdated: result.lastUpdated.toISOString()
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(response);
		} catch (error) {
			request.log.error(
				{ err: error },
				`${ERROR_MESSAGES.FETCH.FAILED_TO_FETCH} leaderboard`
			);
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({
					error: `${LEADERBOARD} ${genericReturnMessages[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR].WENT_WRONG}`
				});
		}
	});
}
