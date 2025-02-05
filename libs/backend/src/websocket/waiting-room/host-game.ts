import { WebSocket } from "@fastify/websocket";
import { generateRandomObjectIdString } from "@/utils/functions/generate-random-object-id-string.js";
import { FastifyInstance } from "fastify";
import { status } from "./status.js";
import { roomById, rooms } from "./redis-keys-functions.js";
import { joinGame } from "./join-game.js";

export async function hostGame({
	userId,
	socket,
	username,
	fastify
}: {
	socket: WebSocket;
	username: string;
	userId: string;
	fastify: FastifyInstance;
}) {
	const randomRoomId = generateRandomObjectIdString();
	const createdAt = new Date();
	const roomMetadata = {
		status: status.WAITING_FOR_PLAYERS,
		createdAt
	};

	// create waiting room
	await fastify.redis.hset(roomById(randomRoomId), roomMetadata);
	await fastify.redis.zadd(rooms, createdAt.getTime(), roomById(randomRoomId));

	joinGame({ socket, fastify, roomId: randomRoomId, userId, username });
}
