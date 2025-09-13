import { WebSocket } from "@fastify/websocket";
import type { AuthenticatedInfo } from "types";
import { sendToUser, broadcastToAll } from "./connection-manager.js";
import { createRoom, joinRoom, leaveRoom, getAllRooms, startGame } from "./room-manager.js";
import { subscribeToEvents } from "./simple-event-bus.js";
import type { WaitingRoomEvent } from "./types.js";

// Message types from client
type ClientMessage = 
	| { event: "HOST_ROOM" }
	| { event: "JOIN_ROOM"; roomId: string }
	| { event: "LEAVE_ROOM"; roomId: string }
	| { event: "START_GAME"; roomId: string };

// Handle incoming WebSocket messages
export async function handleMessage(
	socket: WebSocket, 
	user: AuthenticatedInfo, 
	rawMessage: Buffer | string
): Promise<void> {
	try {
		const message = JSON.parse(rawMessage.toString()) as ClientMessage;
		
		switch (message.event) {
			case "HOST_ROOM": {
				const roomId = await createRoom(user.username);
				sendToUser(user.username, {
					event: "ROOM_CREATED",
					roomId,
				});
				break;
			}
			
			case "JOIN_ROOM": {
				const success = await joinRoom(user.username, message.roomId);
				sendToUser(user.username, {
					event: success ? "ROOM_JOINED" : "JOIN_FAILED",
					roomId: message.roomId,
				});
				break;
			}
			
			case "LEAVE_ROOM": {
				const success = await leaveRoom(user.username, message.roomId);
				sendToUser(user.username, {
					event: success ? "ROOM_LEFT" : "LEAVE_FAILED",
					roomId: message.roomId,
				});
				break;
			}
			
			case "START_GAME": {
				const result = await startGame(message.roomId);
				
				if (!result.success) {
					sendToUser(user.username, {
						event: "START_GAME_FAILED",
						roomId: message.roomId,
						error: result.error || "Unknown error",
					});
				}
				// Success case is handled by the event system
				break;
			}
		}
		
		// Send updated room list to all users
		const rooms = await getAllRooms();
		broadcastToAll({
			event: "ROOMS_UPDATE",
			rooms: rooms.map(room => ({
				id: room.id,
				owner: room.ownerUsername,
				playerCount: room.players.length,
				maxPlayers: room.maxPlayers,
				players: room.playerUsernames, // Include player list for UI
			})),
		});
		
	} catch (error) {
		console.error("Failed to handle message:", error);
		sendToUser(user.username, {
			event: "ERROR",
			message: "Invalid message format",
		});
	}
}

// Set up event listener for Redis events
export function setupEventListener(): void {
	subscribeToEvents((event: WaitingRoomEvent) => {
		// Handle events from other server instances
		switch (event.type) {
			case "user":
				console.log(`User ${event.username} ${event.action}`);
				break;
			case "room":
				console.log(`Room ${event.roomId}: ${event.action} by ${event.username}`);
				break;
			case "game":
				console.log(`Game started for room ${event.roomId}`);
				// Send game start notification to all players
				if (event.action === "started") {
					for (const username of event.players) {
						sendToUser(username, {
							event: "START_GAME",
							gameUrl: event.gameUrl,
						});
					}
				}
				break;
		}
	});
}
