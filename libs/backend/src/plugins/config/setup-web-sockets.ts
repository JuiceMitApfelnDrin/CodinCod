import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onConnection } from "../../websocket/waiting-room/on-connection.js";
import { onMessage } from "../../websocket/waiting-room/on-message.js";
import { updatePlayers } from "../../websocket/waiting-room/update-players.js";
import { onClose } from "../../websocket/waiting-room/on-close.js";
import { OpenGames } from "@/types/games.js";
import { webSocketUrls } from "types";

const games: OpenGames = {};
const activePlayerList: WebSocket[] = [];

export async function setupWebSockets(fastify: FastifyInstance) {
	// needs to happen before other routes in the whole flow

	fastify.get(
		webSocketUrls.WAITING_ROOM,
		{ websocket: true },
		(socket: WebSocket, req: FastifyRequest) => {
			onConnection({ players: activePlayerList, games, newPlayerSocket: socket });

			socket.on("message", (message) => {
				onMessage({ message, games, socket, players: activePlayerList });
				updatePlayers({ sockets: activePlayerList, games });
			});

			socket.on("close", (code, reason) => {
				onClose({ code, reason, players: activePlayerList, playerSocketToRemove: socket, games });
			});
		}
	);

	fastify.get(webSocketUrls.GAME, { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		socket.on("message", (message) => {});

		socket.on("close", (code, reason) => {});
	});
}
