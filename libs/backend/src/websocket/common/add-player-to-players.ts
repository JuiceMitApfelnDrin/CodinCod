import { WebSocket } from "@fastify/websocket";
import { FastifyInstance } from "fastify";

export function addPlayerToPlayers({
	playerSocketToAdd,
	fastify
}: {
	playerSocketToAdd: WebSocket;
	fastify: FastifyInstance;
}) {
	
	// fastify.redis.hset(`players:${playerSocketToAdd.}`)
}
