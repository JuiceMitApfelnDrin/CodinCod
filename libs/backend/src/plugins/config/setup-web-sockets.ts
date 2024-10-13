import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onConnection } from "../../websocket/on-connection.js";
import { onMessage } from "../../websocket/on-message.js";
import { updateActivePlayers } from "../../websocket/update-active-players.js";
import { onClose } from "../../websocket/on-close.js";
import { WebSocketGamesMap } from "@/types/games.js";
import websocket from "@fastify/websocket";

const games: WebSocketGamesMap = new Map();
const activePlayerList: WebSocket[] = [];

export async function setupWebSockets(fastify: FastifyInstance) {
	// needs to happen before other routes in the whole flow
	fastify.register(websocket);

	fastify.get("/", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		onConnection({ activePlayers: activePlayerList, games, newPlayerSocket: socket });

		socket.on("message", (message) => {
			onMessage({ message, games, socket, activePlayers: activePlayerList });
			updateActivePlayers({ sockets: activePlayerList, games });
		});

		socket.on("close", (code, reason) => {
			onClose({ code, reason, activePlayers: activePlayerList, playerSocketToRemove: socket });
		});
	});
}
