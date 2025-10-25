import { FastifyReply, FastifyRequest } from "fastify";
import { httpResponseCodes, isAuthenticatedInfo, isModerator } from "types";
import User from "../../models/user/user.js";

/**
 * Middleware to ensure the user is authenticated and has moderator role
 */
export default async function moderatorOnly(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const token = request.cookies.token;

		if (!token) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
				.send({ message: "No authentication token provided" });
		}

		await request.jwtVerify();

		if (!isAuthenticatedInfo(request.user)) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
				.send({ message: "Invalid credentials" });
		}

		const userId = request.user.userId;
		const user = await User.findById(userId);

		if (!user || !isModerator(user.role)) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
				.send({ message: "Moderator access required" });
		}
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
