import {
	sendInternalError,
	sendUnauthorizedError
} from "@/helpers/error.helpers.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedInfo, cookieKeys } from "types";

export default async function authenticated(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const token = request.cookies[cookieKeys.TOKEN];

	if (!token) {
		sendUnauthorizedError(reply, "Invalid token", request.url);
		return;
	}

	try {
		// Set the Authorization header for jwt.verify to use
		// for some dumb reason it searches on headers.authorization, lost quite a bit of time on this one
		request.headers.authorization = `bearer ${token}`;

		const decoded = await request.jwtVerify<AuthenticatedInfo>();
		request.user = decoded;
	} catch (err) {
		if (err instanceof Error) {
			sendUnauthorizedError(reply, "Invalid token", request.url);
		} else {
			sendInternalError(reply, "An unexpected error occurred", request.url);
		}
	}
}
