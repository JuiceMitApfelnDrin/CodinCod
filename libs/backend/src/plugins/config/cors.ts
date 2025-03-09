import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function corsSetup(fastify: FastifyInstance) {
	fastify.register(cors, {
		allowedHeaders: ["Authorization", "Content-Type"],
		credentials: true,
		origin: false
	});
}

export default fastifyPlugin(corsSetup);
