import { FastifyInstance } from "fastify";
import { cookieKeys, environment, getCookieOptions } from "types";

export default async function logoutRoutes(fastify: FastifyInstance) {
	fastify.post("/", async (request, reply) => {
		try {
			const isProduction = process.env.NODE_ENV === environment.PRODUCTION;

			const cookieOptions = getCookieOptions({
				isProduction,
				...(process.env.FRONTEND_HOST && {
					frontendHost: process.env.FRONTEND_HOST
				})
			});

			// Clear the cookie using Fastify's clearCookie method
			reply.clearCookie(cookieKeys.TOKEN, cookieOptions);

			return reply.status(200).send({ message: "Logout successful" });
		} catch (error) {
			console.error("Logout error:", error);
			return reply.status(500).send({ message: "Logout failed" });
		}
	});
}
