import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { updatePlayer } from "../common/update-player.js";
import { GameEventEnum } from "types";
import { FastifyInstance } from "fastify";

export function updatePlayers({ fastify }: { fastify: FastifyInstance }) {
	fastify.redis.hg;

	for (const socket of fastify.websocketServer.clients) {
		updatePlayer({
			socket,
			event: GameEventEnum.OVERVIEW_OF_GAMES,
			data: joinableGames
		});
	}
}
