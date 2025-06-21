import { FastifyInstance } from "fastify";
import { waitingRoomSetup } from "@/websocket/waiting-room/waiting-room-setup.js";
import { gameSetup } from "@/websocket/game/game-setup.js";
import authenticated from "../middleware/authenticated.js";
import { webSocketParams, webSocketUrls } from "types";
import { ParamsId } from "@/types/types.js";

export async function setupWebSockets(fastify: FastifyInstance) {
	// needs to happen before other routes in the whole flow

	fastify.addHook("preValidation", authenticated);
	fastify.get(webSocketUrls.WAITING_ROOM, { websocket: true }, (...props) =>
		waitingRoomSetup(...props, fastify)
	);

	fastify.addHook("preValidation", authenticated);
	fastify.get<ParamsId>(
		webSocketUrls.gameById(webSocketParams.ID),
		{ websocket: true },
		(...props) => gameSetup(...props, fastify)
	);
}
