import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "types";

export default async function authenticated(request: FastifyRequest, reply: FastifyReply) {
	const token = request.cookies.token;

	if (!token) {
		return reply.status(401).send({ message: "Unauthorized" });
	}

	try {
		// Set the Authorization header for jwt.verify to use
		// for some dumb reason it searches on headers.authorization, lost quite a bit of time on this one
		request.headers.authorization = `bearer ${token}`;

		const decoded = await request.jwtVerify<JwtPayload>();
		request.user = decoded;
	} catch (err) {
		console.log("Token verification error:", { err, token }); // Log error message
		if (err instanceof Error) {
			return reply.status(401).send({ message: "Invalid token" });
		}
		return reply.status(500).send({ message: "An unexpected error occurred." });
	}
}

// TODO: if cookie works, remove below
// export default async function authenticate(
// 	fastify: FastifyInstance,
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	try {
// 		if (!request.headers.authorization) {
// 			throw new Error("No authorization header found");
// 		}

// 		const token = request.headers.authorization.split(' ')[1];
// 		const decodedToken = fastify.jwt.decode(token) as JwtPayload;

// 		if (decodedToken) {
// 			request.user = {
// 				userId: decodedToken.userId,
// 				username: decodedToken.username
// 			};
// 		} else {
// 			throw new Error('Invalid token');
// 		}
// 	} catch (err) {
// 		reply.status(401).send({ error: "Invalid token" });
// 	}
// }
