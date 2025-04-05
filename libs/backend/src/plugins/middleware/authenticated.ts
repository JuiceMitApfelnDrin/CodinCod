import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedInfo, httpResponseCodes } from "types";

export default async function authenticated(request: FastifyRequest, reply: FastifyReply) {
	const token = request.cookies.token;

	if (!token) {
		return reply
			.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
			.send({ message: "Unauthorized" });
	}

	try {
		// Set the Authorization header for jwt.verify to use
		// for some dumb reason it searches on headers.authorization, lost quite a bit of time on this one
		request.headers.authorization = `bearer ${token}`;

		const decoded = await request.jwtVerify<AuthenticatedInfo>();
		request.user = decoded;
	} catch (err) {
		if (err instanceof Error) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
				.send({ message: "Invalid token" });
		}

		return reply
			.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
			.send({ message: "An unexpected error occurred." });
	}
}
