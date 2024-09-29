import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { userEntitySchema } from "types";

export default async function userByUsernameRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (request, reply) => {
		const parseResult = userEntitySchema.pick({ username: true }).safeParse(request.params);

		if (!parseResult.success) {
			return reply.status(400).send({ message: "Invalid request data" });
		}

		const { username } = parseResult.data;

		try {
			const user = await User.findOne({ username });

			if (!user) {
				return reply.status(404).send({ message: "User not found" });
			}

			return reply.status(200).send({ user, message: "User found", activities: [] });
		} catch (error) {
			reply.status(500).send({ message: "Internal Server Error" });
		}
	});
}
