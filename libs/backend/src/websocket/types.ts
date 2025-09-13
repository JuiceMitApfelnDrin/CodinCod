import { z } from "zod";

// Simple event types
export const UserEvent = z.object({
	type: z.literal("user"),
	action: z.enum(["connected", "disconnected"]),
	username: z.string(),
	socketId: z.string().optional(),
});

export const RoomEvent = z.object({
	type: z.literal("room"),
	action: z.enum(["created", "joined", "left", "deleted"]),
	roomId: z.string(),
	username: z.string(),
	playerCount: z.number().optional(),
});

export const GameEvent = z.object({
	type: z.literal("game"),
	action: z.enum(["started"]),
	roomId: z.string(),
	gameUrl: z.string(),
	players: z.array(z.string()),
});

export const WaitingRoomEvent = z.discriminatedUnion("type", [
	UserEvent,
	RoomEvent,
	GameEvent,
]);

export type UserEvent = z.infer<typeof UserEvent>;
export type RoomEvent = z.infer<typeof RoomEvent>;
export type GameEvent = z.infer<typeof GameEvent>;
export type WaitingRoomEvent = z.infer<typeof WaitingRoomEvent>;

// State types
export type UserState = {
	username: string;
	userId: string; // MongoDB user ID
	socketId: string;
	roomId: string | null;
	lastSeen: number;
};

export type RoomState = {
	id: string;
	owner: string; // MongoDB user ID
	ownerUsername: string; // For display purposes
	players: string[]; // Array of MongoDB user IDs
	playerUsernames: string[]; // For display purposes
	createdAt: number;
	maxPlayers: number;
};
