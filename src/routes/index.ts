import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user/user.js";
import { resolve } from "path";
import { promises } from "fs";
import { userEntitySchema } from "types";

export default async function indexRoutes(fastify: FastifyInstance) {
	fastify.get("/", async function (_request: FastifyRequest, reply: FastifyReply) {
		const { readFile } = promises;

		const indexHtmlPath = resolve(__dirname, "../../static/index.html");
		const indexHtmlContent = await readFile(indexHtmlPath);
		reply.header("Content-Type", "text/html; charset=utf-8").send(indexHtmlContent);
	});

	/**
	 * temporary call
	 * TODO: remove this and replace where used with get user where { username: something }
	 */
	fastify.get("/api/v1/check-username/:username", async (request, reply) => {
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
