import { FastifyReply, FastifyRequest } from "fastify";
import { httpResponseCodes, cookieKeys, environment, AuthenticatedInfo } from "types";

export default async function authenticated(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const token = request.cookies[cookieKeys.TOKEN];

		if (process.env.NODE_ENV === environment.DEVELOPMENT) {
			request.log.info({
				middleware: "authenticated",
				action: "check_token",
				hasToken: !!token,
				cookieKeys: Object.keys(request.cookies),
				url: request.url,
				method: request.method
			});
		}

		if (!token) {
			if (process.env.NODE_ENV === environment.DEVELOPMENT) {
				request.log.warn({
					middleware: "authenticated",
					action: "no_token",
					url: request.url
				});
			}
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
				.send({ message: "No authentication token provided" });
		}

		await request.jwtVerify();

		if (process.env.NODE_ENV === environment.DEVELOPMENT) {
			request.log.info({
				middleware: "authenticated",
				action: "jwt_verified",
				userId: (request.user as AuthenticatedInfo)?.userId,
				url: request.url
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === environment.DEVELOPMENT) {
			request.log.error({
				middleware: "authenticated",
				action: "jwt_verify_failed",
				error: err instanceof Error ? err.message : "Unknown error",
				url: request.url
			});
		}

		if (err instanceof Error) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ message: err.message });
		}

		return reply
			.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
			.send({ message: "An unexpected error occurred." });
	}
}
