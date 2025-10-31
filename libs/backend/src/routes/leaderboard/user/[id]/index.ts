import { genericReturnMessages } from "@/config/generic-return-messages.js";
import User from "@/models/user/user.js";
import { leaderboardService } from "@/services/leaderboard.service.js";
import { FastifyInstance } from "fastify";
import { ERROR_MESSAGES, httpResponseCodes, LeaderboardAPI } from "types";

const USER = "User";

export default async function leaderboardUserByIdRoutes(
	fastify: FastifyInstance
) {
	fastify.get<{ Params: { id: string } }>("/", async (request, reply) => {
		const { id } = request.params;

		try {
			const user = await User.findById(id);
			if (!user) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
					error: `${USER} ${genericReturnMessages[httpResponseCodes.CLIENT_ERROR.NOT_FOUND].COULD_NOT_BE_FOUND}`
				});
			}

			const rankings = await leaderboardService.getUserRankings(id);

			const response: LeaderboardAPI.GetUserLeaderboardStatsResponse = {
				userId: id,
				username: user.username,
				rankings
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(response);
		} catch (error) {
			request.log.error(
				{ err: error },
				`${ERROR_MESSAGES.FETCH.FAILED_TO_FETCH} user rankings`
			);
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({
					error: `User rankings ${genericReturnMessages[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]}`
				});
		}
	});
}
