import { FastifyReply, FastifyRequest } from "fastify";
import {
	httpResponseCodes,
	isAuthenticatedInfo,
	banTypeEnum,
	environment
} from "types";
import { checkUserBanStatus } from "../../utils/moderation/escalation.js";

export default async function checkUserBan(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	if (process.env.NODE_ENV === environment.DEVELOPMENT) {
		request.log.info({
			middleware: "checkUserBan",
			action: "check_auth",
			hasUser: !!request.user,
			isAuthenticated: isAuthenticatedInfo(request.user),
			url: request.url
		});
	}

	if (!isAuthenticatedInfo(request.user)) {
		if (process.env.NODE_ENV === environment.DEVELOPMENT) {
			request.log.warn({
				middleware: "checkUserBan",
				action: "not_authenticated",
				user: request.user,
				url: request.url
			});
		}
		return reply
			.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
			.send({ error: "Authentication required" });
	}

	const { isBanned, ban } = await checkUserBanStatus(request.user.userId);

	if (process.env.NODE_ENV === environment.DEVELOPMENT) {
		request.log.info({
			middleware: "checkUserBan",
			action: "ban_status_checked",
			userId: request.user.userId,
			isBanned,
			url: request.url
		});
	}

	if (isBanned && ban) {
		const message =
			ban.banType === banTypeEnum.PERMANENT
				? `You have been permanently banned. Reason: ${ban.reason}`
				: `You are temporarily banned until ${ban.endDate?.toISOString()}. Reason: ${ban.reason}`;

		if (process.env.NODE_ENV === environment.DEVELOPMENT) {
			request.log.warn({
				middleware: "checkUserBan",
				action: "user_banned",
				userId: request.user.userId,
				banType: ban.banType,
				url: request.url
			});
		}

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
