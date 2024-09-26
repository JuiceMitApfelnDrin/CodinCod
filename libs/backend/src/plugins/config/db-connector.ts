import fastifyPlugin from "fastify-plugin";
import fastifyMongo from "@fastify/mongodb";
import { FastifyInstance } from "fastify";

async function dbConnectorSetup(fastify: FastifyInstance) {
	fastify.register(fastifyMongo, {
		url: process.env.MONGO_URI
	});
}

export default fastifyPlugin(dbConnectorSetup);
