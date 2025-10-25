import { FastifyInstance } from "fastify";
import { waitingRoomSetup } from "@/websocket/waiting-room/waiting-room-setup.js";
import { gameSetup } from "@/websocket/game/game-setup.js";
import authenticated from "../middleware/authenticated.js";
import { webSocketParams, webSocketUrls } from "types";
import { ParamsId } from "@/types/types.js";
import { ConnectionManager } from "@/websocket/connection-manager.js";

export async function setupWebSockets(fastify: FastifyInstance) {
	const connectionManager = new ConnectionManager();

	// Rate limit config for WebSocket upgrade requests
	// This limits the initial connection attempts, not the messages sent over the connection
	const wsRateLimit = {
		max: 20,
		timeWindow: "1 minute"
	};

	fastify.get(
		webSocketUrls.WAITING_ROOM,
		{
			websocket: true,
			preHandler: authenticated,
			config: {
				rateLimit: wsRateLimit
			}
		},
		(...props) => waitingRoomSetup(...props, fastify)
	);

	fastify.get<ParamsId>(
		webSocketUrls.gameById(webSocketParams.ID),
		{
			websocket: true,
			preHandler: authenticated,
			config: {
				rateLimit: wsRateLimit
			}
		},
		(...props) => gameSetup(...props, fastify)
	);

	fastify.addHook("onClose", async () => {
		console.info("Shutting down WebSocket connections...");
		connectionManager.destroy();
	});
}
