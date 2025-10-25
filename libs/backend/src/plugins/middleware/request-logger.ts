import fastifyPlugin from "fastify-plugin";
import { FastifyInstance } from "fastify";

async function requestLogger(fastify: FastifyInstance) {
	fastify.addHook("preHandler", async (request) => {
		console.log(
			`[${new Date().toISOString()}] ${request.method} ${request.url}`
		);
	});
}

export default fastifyPlugin(requestLogger);
