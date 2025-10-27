import { FastifyReply, FastifyRequest } from "fastify";
import {
	httpResponseCodes,
	cookieKeys,
	environment,
	AuthenticatedInfo
} from "types";

export default async function authenticated(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const token = request.cookies[cookieKeys.TOKEN];

		if (!token) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
				.send({ message: "No authentication token provided" });
		}

		await request.jwtVerify();
	} catch (err) {
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
