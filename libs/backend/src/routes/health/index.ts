import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const healthResponse = "OK";

export default async function healthRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
		reply.send({ status: healthResponse });
	});
}
