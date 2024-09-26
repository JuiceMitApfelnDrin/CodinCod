import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function healthRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
		reply.send({ status: "OK" });
	});
}
