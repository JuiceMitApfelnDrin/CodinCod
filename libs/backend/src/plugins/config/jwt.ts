import fastifyPlugin from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";

async function jwtSetup(fastify: FastifyInstance) {
	const JWT_SECRET = process.env.JWT_SECRET;

	if (!JWT_SECRET) {
		throw new Error("JWT secret is not defined in environment variables");
	}

	fastify.register(jwt, {
		secret: JWT_SECRET
	});
}

export default fastifyPlugin(jwtSetup);
