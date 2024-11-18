import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { onConnection } from "./on-connection.js";
import { ParamsId } from "@/routes/puzzle/[id]/types.js";

export function playGame(socket: WebSocket, req: FastifyRequest<ParamsId>) {
	const { id } = req.params;

	onConnection({ socket, id });

	socket.on("message", (message) => {});

	socket.on("close", (code, reason) => {});
}
