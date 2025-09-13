import { WebSocket } from "@fastify/websocket";
import type { UserState } from "./types.js";
import { setUserState, removeUserState, getUserIdByUsername } from "./state-manager.js";
import { publishEvent } from "./simple-event-bus.js";
import { WEBSOCKET_CONSTANTS } from "@/config/constants.js";

// Simple in-memory socket tracking for this server instance
const socketsByUsername = new Map<string, WebSocket>();

// Connect user
export async function connectUser(username: string, socket: WebSocket): Promise<void> {
	const socketId = generateSocketId();
	
	// Get user ID from database
	const userId = await getUserIdByUsername(username);
	if (!userId) {
		console.error(`Could not find user ID for username: ${username}`);
		socket.close(WEBSOCKET_CONSTANTS.SOCKET.CLOSE_CODES.USER_NOT_FOUND, "User not found");
		return;
	}
	
	// Store socket locally
	socketsByUsername.set(username, socket);
	
	// Store state in Redis
	const userState: UserState = {
		username,
		userId,
		socketId,
		roomId: null,
		lastSeen: Date.now(),
	};
	
	await setUserState(username, userState);
	
	// Publish event
	await publishEvent({
		type: "user",
		action: "connected",
		username,
		socketId,
	});
	
	// Set up disconnect handler
	socket.on("close", () => disconnectUser(username));
	socket.on("error", () => disconnectUser(username));
}

// Disconnect user
export async function disconnectUser(username: string): Promise<void> {
	const socket = socketsByUsername.get(username);
	if (!socket) return;
	
	// Clean up local state
	socketsByUsername.delete(username);
	
	// Clean up Redis state
	await removeUserState(username);
	
	// Publish event
	await publishEvent({
		type: "user",
		action: "disconnected",
		username,
	});
}

// Send message to user (on this server)
export function sendToUser(username: string, message: object): boolean {
	const socket = socketsByUsername.get(username);
	if (!socket) return false;
	
	try {
		socket.send(JSON.stringify(message));
		return true;
	} catch (error) {
		console.error(`Failed to send message to ${username}:`, error);
		return false;
	}
}

// Broadcast to all connected users (on this server)
export function broadcastToAll(message: object): void {
	const messageStr = JSON.stringify(message);
	for (const socket of socketsByUsername.values()) {
		try {
			socket.send(messageStr);
		} catch (error) {
			console.error("Failed to broadcast message:", error);
		}
	}
}

// Get socket for username (local only)
export function getSocket(username: string): WebSocket | undefined {
	return socketsByUsername.get(username);
}

// Helper
function generateSocketId(): string {
	return `${WEBSOCKET_CONSTANTS.SOCKET.ID_PREFIX}${Math.random().toString(36).substring(2, WEBSOCKET_CONSTANTS.SOCKET.ID_LENGTH)}`;
}
