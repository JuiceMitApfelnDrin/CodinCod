import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { onConnection } from "./on-connection.js";
import { ParamsId } from "@/routes/puzzle/[id]/types.js";
import { onClose } from "./on-close.js";

export function playGame(socket: WebSocket, req: FastifyRequest<ParamsId>) {
	const { id } = req.params;

	const playersInCurrentGame: WebSocket[] = [];

	onConnection({ socket, id, players: playersInCurrentGame });

	socket.on("message", (message) => {
		// TODO: continue here next time
		console.log(message.toString());
	});

	socket.on("close", (code, reason) => {
		onClose({ players: playersInCurrentGame, code, reason, playerSocketToRemove: socket });
	});
}
