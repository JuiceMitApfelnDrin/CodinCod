import { FastifyInstance } from "fastify";
import authenticated from "../../plugins/middleware/authenticated.js";
import { AuthenticatedInfo } from "types";

export default async function userRoutes(fastify: FastifyInstance) {
	// This plugin is registered with prefix /api/v1/user
	// So we only need to register /me to get /api/v1/user/me
	fastify.get(
		"/me",
		{
			preHandler: authenticated
		},
		async (request, reply) => {
			const user = request.user as AuthenticatedInfo | undefined;

			if (!user) {
				return reply.status(401).send({
					isAuthenticated: false,
					message: "Not authenticated"
				});
			}

			return reply.status(200).send({
				isAuthenticated: true,
				userId: user.userId,
				username: user.username
			});
		}
	);
}
