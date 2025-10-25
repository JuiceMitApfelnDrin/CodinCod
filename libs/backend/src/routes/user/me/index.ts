import { FastifyInstance } from "fastify";
import authenticated from "../../../plugins/middleware/authenticated.js";
import { AuthenticatedInfo, DEFAULT_USER_ROLE } from "types";
import User from "../../../models/user/user.js";

export default async function userMeRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/",
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

			try {
				// Fetch the user from database to get the role
				const dbUser = await User.findById(user.userId);

				return reply.status(200).send({
					isAuthenticated: true,
					userId: user.userId,
					username: user.username,
					role: dbUser?.role || DEFAULT_USER_ROLE
				});
			} catch (error) {
				fastify.log.error(error, "Failed to fetch user data");
				return reply.status(500).send({
					isAuthenticated: false,
					message: "Failed to fetch user data"
				});
			}
		}
	);
}
