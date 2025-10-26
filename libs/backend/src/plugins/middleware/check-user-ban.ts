import { FastifyReply, FastifyRequest } from "fastify";
import { httpResponseCodes, isAuthenticatedInfo, banTypeEnum } from "types";
import { checkUserBanStatus } from "../../utils/moderation/escalation.js";

/**
 * Middleware to check if user is currently banned
 * Blocks banned users from accessing protected routes
 */
async function checkUserBan(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	if (!isAuthenticatedInfo(request.user)) {
		return reply
			.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
			.send({ error: "Authentication required" });
	}

	const { isBanned, ban } = await checkUserBanStatus(request.user.userId);

	if (isBanned && ban) {
		const message =
			ban.banType === banTypeEnum.PERMANENT
				? `You have been permanently banned. Reason: ${ban.reason}`
				: `You are temporarily banned until ${ban.endDate?.toISOString()}. Reason: ${ban.reason}`;

		return reply.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN).send({
			error: message,
			banDetails: {
				type: ban.banType,
				reason: ban.reason,
				endDate: ban.endDate
			}
		});
	}
}

export default checkUserBan;
