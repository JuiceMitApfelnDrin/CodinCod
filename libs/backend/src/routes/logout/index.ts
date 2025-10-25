import { FastifyInstance } from "fastify";
import { cookieKeys, environment } from "types";

export default async function logoutRoutes(fastify: FastifyInstance) {
	fastify.post("/", async (request, reply) => {
		try {
			const isProduction = process.env.NODE_ENV === environment.PRODUCTION;

			const cookieOptions: any = {
				path: "/",
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax"
			};

			// Set domain for cross-subdomain cookies in production
			if (isProduction) {
				cookieOptions.domain = process.env.FRONTEND_HOST;
			}

			// Clear the cookie using Fastify's clearCookie method
			reply.clearCookie(cookieKeys.TOKEN, cookieOptions);

			return reply.status(200).send({ message: "Logout successful" });
		} catch (error) {
			console.error("Logout error:", error);
			return reply.status(500).send({ message: "Logout failed" });
		}
	});
}
