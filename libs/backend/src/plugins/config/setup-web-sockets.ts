import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onConnection } from "../../websocket/on-connection.js";
import { onMessage } from "../../websocket/on-message.js";
import { updatePlayers } from "../../websocket/update-players.js";
import { onClose } from "../../websocket/on-close.js";
import { OpenGames } from "@/types/games.js";

const games: OpenGames = {};
const activePlayerList: WebSocket[] = [];

export async function setupWebSockets(fastify: FastifyInstance) {
	// needs to happen before other routes in the whole flow

	fastify.get("/", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		onConnection({ players: activePlayerList, games, newPlayerSocket: socket });

		socket.on("message", (message) => {
			onMessage({ message, games, socket, players: activePlayerList });
			updatePlayers({ sockets: activePlayerList, games });
		});

		socket.on("close", (code, reason) => {
			onClose({ code, reason, players: activePlayerList, playerSocketToRemove: socket, games });
		});
	});
}
