import fastifyRedis from "@fastify/redis";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function redisSetup(fastify: FastifyInstance) {
	const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

	if (!REDIS_PASSWORD) {
		throw new Error("REDIS_PASSWORD is not defined in environment variables");
	}

	fastify.register(fastifyRedis, {
		host: "localhost",
		password: REDIS_PASSWORD,
		port: 6379
	});
}

export default fastifyPlugin(redisSetup);
