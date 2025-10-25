import fastifyPlugin from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import { cookieKeys } from "types";

async function jwtSetup(fastify: FastifyInstance) {
	const JWT_SECRET = process.env.JWT_SECRET;

	if (!JWT_SECRET) {
		throw new Error("JWT secret is not defined in environment variables");
	}

	fastify.register(jwt, {
		secret: JWT_SECRET,
		cookie: {
			cookieName: cookieKeys.TOKEN,
			signed: false
		},
		formatUser: function (payload) {
			// Return the payload as-is without any transformation or validation
			// This prevents @fastify/jwt from doing any automatic schema validation
			return payload;
		},
		// Add decode option to see raw decoded payload
		decode: { complete: false }
	});
}

export default fastifyPlugin(jwtSetup);
