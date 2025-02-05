import { WebSocket } from "@fastify/websocket";
import { onConnection } from "./on-connection.js";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onMessage } from "./on-message.js";
import { onClose } from "./on-close.js";
import { isAuthenticatedInfo } from "types";

export function waitingRoom(socket: WebSocket, req: FastifyRequest, fastify: FastifyInstance) {
	onConnection({
		newPlayerSocket: socket,
		fastify
	});

	socket.on("message", (message) => {
		if (!req.user || !isAuthenticatedInfo(req.user)) {
			return;
		}

		onMessage({
			message,
			socket,
			fastify,
			userId: req.user.userId,
			username: req.user.username
		});
	});

	socket.on("close", (code, reason) => {
		onClose({
			code,
			reason,
			players: activePlayerList,
			playerSocketToRemove: socket,
			games,
			fastify
		});
	});
}
