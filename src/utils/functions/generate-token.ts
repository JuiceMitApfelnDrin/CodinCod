import { FastifyInstance } from "fastify";
import { AuthenticatedInfo } from "types";

export function generateToken(fastify: FastifyInstance, payload: AuthenticatedInfo): string {
	try {
		return fastify.jwt.sign(payload, { expiresIn: "24h" });
	} catch (error) {
		console.error("Error generating token:", error);
		throw new Error("Token generation failed");
	}
}
