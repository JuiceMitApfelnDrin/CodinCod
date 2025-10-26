import { FastifyInstance } from "fastify";
import { httpResponseCodes, isAuthenticatedInfo, unbanUserSchema } from "types";
import moderatorOnly from "../../../../../plugins/middleware/moderator-only.js";
import { ParamsId } from "../../../../../types/types.js";
import { unbanUser } from "../../../../../utils/moderation/escalation.js";

export default async function moderationUserByIdBanUnbanRoutes(
	fastify: FastifyInstance
) {
	fastify.post<ParamsId>(
		"/",
		{
			onRequest: moderatorOnly
		},
		async (request, reply) => {
			const { id } = request.params;

			const parseResult = unbanUserSchema.safeParse(request.body);
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

			try {
				await unbanUser(id, request.user.userId, parseResult.data.reason);

				return reply.send({
					message: "User unbanned successfully"
				});
			} catch (error) {
				fastify.log.error(error, "Failed to unban user");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to unban user" });
			}
		}
	);
}
