import { FastifyInstance } from "fastify";
import { webSocketUrls } from "types";
import { waitingRoom } from "@/websocket/waiting-room/waiting-room.js";
import { playGame } from "@/websocket/game/play-game.js";
import { ParamsId } from "@/types/types.js";

export async function setupWebSockets(fastify: FastifyInstance) {
	// needs to happen before other routes in the whole flow

	fastify.get(webSocketUrls.WAITING_ROOM, { websocket: true }, (...props) =>
		waitingRoom(...props, fastify)
	);

	fastify.get<ParamsId>(webSocketUrls.GAME, { websocket: true }, (...props) =>
		playGame(...props, fastify)
	);
}
