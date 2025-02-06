import { WebSocket } from "@fastify/websocket";
import { FastifyInstance } from "fastify";
import { updatePlayer } from "../common/update-player.js";
import { GameEventEnum } from "types";
import { rooms } from "./redis-keys-functions.js";

export async function onConnection({
	newPlayerSocket,
	fastify
}: {
	newPlayerSocket: WebSocket;
	fastify: FastifyInstance;
}) {
	// when a user first connects
	// send them games info and ask them to send their username / userid

	const allRooms = await fastify.redis.zrange(rooms, 0, -1);

	updatePlayer({
		socket: newPlayerSocket,
		event: GameEventEnum.OVERVIEW_OF_GAMES
		// data: { rooms: allRooms }
	});
}
