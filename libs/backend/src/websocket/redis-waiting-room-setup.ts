import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { isAuthenticatedInfo, waitingRoomEventEnum } from "types";
import { connectUser, sendToUser } from "./connection-manager.js";
import { handleMessage, setupEventListener } from "./message-handler.js";
import { getAllRooms } from "./room-manager.js";

// Initialize the event system once
let isInitialized = false;

export async function redisWaitingRoomSetup(
	socket: WebSocket,
	req: FastifyRequest
): Promise<void> {
	if (!isAuthenticatedInfo(req.user)) {
		socket.close(1008, "Unauthorized");
		return;
	}

	// Initialize event system once
	if (!isInitialized) {
		setupEventListener();
		isInitialized = true;
	}

	const username = req.user.username;

	// Connect user
	await connectUser(username, socket);

	// Send initial room list using existing enum
	const rooms = await getAllRooms();
	sendToUser(username, {
		event: waitingRoomEventEnum.OVERVIEW_OF_ROOMS,
		rooms: rooms.map((room) => ({
			id: room.id,
			owner: room.ownerUsername,
			playerCount: room.players.length,
			maxPlayers: room.maxPlayers,
			players: room.playerUsernames
		}))
	});

	// Handle messages
	socket.on("message", (rawMessage) => {
		if (!isAuthenticatedInfo(req.user)) return;

		const message = Buffer.isBuffer(rawMessage)
			? rawMessage
			: Buffer.from(rawMessage as ArrayBuffer);

		handleMessage(socket, req.user, message);
	});
}
