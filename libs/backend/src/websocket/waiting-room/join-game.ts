import { GameEventEnum } from "types";
import { updatePlayer } from "../common/update-player.js";
import { updatePlayersInGame } from "./update-players-in-game.js";
import { WebSocket } from "@fastify/websocket";
import { FastifyInstance } from "fastify";
import { roomByIdPlayers } from "./redis-keys-functions.js";

export async function joinGame({
	roomId,
	userId,
	socket,
	username,
	fastify
}: {
	roomId: string;
	socket: WebSocket;
	username: string;
	userId: string;
	fastify: FastifyInstance;
}) {
	fastify.redis.sadd(roomByIdPlayers(roomId), JSON.stringify({ userId, username }));

	// notify people someone joined
	updatePlayer({
		socket,
		event: GameEventEnum.JOIN_GAME,
		message: "user joined the waiting room",
		data: {
			userId,
			username
		}
	});

	// how can we identify which websocket belongs to who? :Thinkge:

	updatePlayersInGame({ game });
}
