import { WebSocket } from "@fastify/websocket";
import { onConnection } from "./on-connection.js";
import { FastifyInstance, FastifyRequest } from "fastify";
import { OpenGames } from "@/types/games.js";
import { onMessage } from "./on-message.js";
import { updatePlayers } from "./update-players.js";
import { onClose } from "./on-close.js";

const games: OpenGames = {};
const activePlayerList: WebSocket[] = [];

export function waitingRoom(socket: WebSocket, req: FastifyRequest, fastify: FastifyInstance) {
	const frontendUrl = req.headers.origin;
	console.log({ frontendUrl });

	onConnection({ players: activePlayerList, games, newPlayerSocket: socket });

	socket.on("message", (message) => {
		onMessage({ message, games, socket, players: activePlayerList });
		updatePlayers({ sockets: activePlayerList, games });
	});

	socket.on("close", (code, reason) => {
		onClose({ code, reason, players: activePlayerList, playerSocketToRemove: socket, games });
	});
}
