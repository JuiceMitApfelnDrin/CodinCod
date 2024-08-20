import { FastifyInstance } from "fastify";
import { JwtPayload } from "types";

export function generateToken(fastify: FastifyInstance, payload: JwtPayload): string {
	try {
		return fastify.jwt.sign(payload, { expiresIn: "24h" });
	} catch (error) {
		console.error("Error generating token:", error);
		throw new Error("Token generation failed");
	}
}
