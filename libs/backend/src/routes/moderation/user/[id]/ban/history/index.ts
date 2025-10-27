import { FastifyInstance } from "fastify";
import { httpResponseCodes, isAuthenticatedInfo } from "types";
import moderatorOnly from "../../../../../../plugins/middleware/moderator-only.js";
import { ParamsId } from "../../../../../../types/types.js";
import UserBan from "../../../../../../models/moderation/user-ban.js";

export default async function moderationUserByIdBanHistoryRoutes(
	fastify: FastifyInstance
) {
	fastify.get<ParamsId>(
		"/",
		{
			onRequest: moderatorOnly
		},
		async (request, reply) => {
			const { id } = request.params;

			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			try {
				const bans = await UserBan.find({ userId: id })
					.populate("bannedBy", "username")
					.sort({ createdAt: -1 })
					.exec();

				return reply.send({
					bans
				});
			} catch (error) {
				fastify.log.error(error, "Failed to fetch ban history");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch ban history" });
			}
		}
	);
}
