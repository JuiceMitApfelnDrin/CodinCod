import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function corsSetup(fastify: FastifyInstance) {
	fastify.register(cors, {
		allowedHeaders: ["Authorization", "Content-Type"],
		credentials: true,
		origin: process.env.FRONTEND_URL ?? "http://localhost:5173"
	});
}

export default fastifyPlugin(corsSetup);
