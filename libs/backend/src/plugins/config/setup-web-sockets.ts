import { FastifyInstance } from "fastify";
import { webSocketUrls } from "types";
import { waitingRoomSetup } from "@/websocket/waiting-room/waiting-room-setup.js";
import { playGameSetup } from "@/websocket/game/play-game-setup.js";
import { ParamsId } from "@/routes/puzzle/[id]/types.js";
import authenticated from "../middleware/authenticated.js";

export async function setupWebSockets(fastify: FastifyInstance) {
	// needs to happen before other routes in the whole flow

	fastify.addHook("preValidation", authenticated);
	fastify.get(webSocketUrls.WAITING_ROOM, { websocket: true }, (...props) =>
		waitingRoomSetup(...props, fastify)
	);

	fastify.addHook("preValidation", authenticated);
	fastify.get<ParamsId>(webSocketUrls.GAME, { websocket: true }, (...props) =>
		playGameSetup(...props, fastify)
	);
}
