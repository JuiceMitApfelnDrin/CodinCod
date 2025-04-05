import { FastifyRequest } from "fastify";
import { AuthenticatedInfo } from "types";

export default async function decodeToken(request: FastifyRequest) {
	try {
		// Set the Authorization header for jwt.verify to use
		// for some dumb reason it searches on headers.authorization, lost quite a bit of time on this one
		request.headers.authorization = `bearer ${request.cookies.token}`;

		const decoded = await request.jwtVerify<AuthenticatedInfo>();

		request.user = decoded;
	} catch (err) {}
}
