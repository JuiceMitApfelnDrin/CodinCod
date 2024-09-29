import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { userEntitySchema } from "types";

export default async function userByUsernameIsAvailableRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (request, reply) => {
		const parseResult = userEntitySchema.pick({ username: true }).safeParse(request.params);

		if (!parseResult.success) {
			return reply.status(400).send({ message: "Invalid request data" });
		}

		const { username } = parseResult.data;

		try {
			const existingUser = await User.findOne({ username });

			if (existingUser) {
				return reply.status(200).send({ isAvailable: false });
			}

			return reply.status(200).send({ isAvailable: true });
		} catch (error) {
			reply.status(500).send({ message: "Internal Server Error" });
		}
	});
}
