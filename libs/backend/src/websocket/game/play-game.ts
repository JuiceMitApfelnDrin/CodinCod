import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { onConnection } from "./on-connection.js";
import { ParamsId } from "@/routes/puzzle/[id]/types.js";
import { onClose } from "./on-close.js";
import { onMessage } from "./on-message.js";

const playersInCurrentGame: WebSocket[] = [];

export function playGame(socket: WebSocket, req: FastifyRequest<ParamsId>) {
	const { id } = req.params;

	onConnection({ socket, id, players: playersInCurrentGame });

	socket.on("message", (message) => {
		onMessage({ message, id, socket, players: playersInCurrentGame });
	});

	socket.on("close", (code, reason) => {
		onClose({ players: playersInCurrentGame, code, reason, playerSocketToRemove: socket });
	});
}
