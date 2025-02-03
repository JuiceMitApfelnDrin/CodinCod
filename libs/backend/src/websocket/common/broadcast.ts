import { FastifyInstance } from "fastify";

export function broadcast(fastify: FastifyInstance, message: any) {
	for (let client of fastify.websocketServer.clients) {
		client.send(JSON.stringify(message));
	}
}
