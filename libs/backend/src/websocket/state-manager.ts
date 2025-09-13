import { getRedis } from "./redis-client.js";
import type { UserState, RoomState } from "./types.js";
import User from "@/models/user/user.js";
import { WEBSOCKET_CONSTANTS } from "@/config/constants.js";

// User state functions
export async function setUserState(
	username: string,
	state: UserState
): Promise<void> {
	const redis = getRedis();
	await redis.hset(
		`${WEBSOCKET_CONSTANTS.REDIS.KEYS.USER_PREFIX}${username}`,
		state
	);
}

export async function getUserState(
	username: string
): Promise<UserState | null> {
	const redis = getRedis();
	const data = await redis.hgetall(
		`${WEBSOCKET_CONSTANTS.REDIS.KEYS.USER_PREFIX}${username}`
	);

	if (!data.username) return null;

	return {
		username: data.username,
		userId: data.userId,
		socketId: data.socketId,
		roomId: data.roomId || null,
		lastSeen: parseInt(data.lastSeen, 10)
	};
}

export async function removeUserState(username: string): Promise<void> {
	const redis = getRedis();
	await redis.del(`${WEBSOCKET_CONSTANTS.REDIS.KEYS.USER_PREFIX}${username}`);
}

// Get user ID from username
export async function getUserIdByUsername(
	username: string
): Promise<string | null> {
	try {
		const user = await User.findOne({ username }).select("_id").exec();
		return user ? user._id.toString() : null;
	} catch (error) {
		console.error(`Failed to get user ID for ${username}:`, error);
		return null;
	}
}

// Room state functions
export async function setRoomState(
	roomId: string,
	state: RoomState
): Promise<void> {
	const redis = getRedis();
	await redis.hset(`${WEBSOCKET_CONSTANTS.REDIS.KEYS.ROOM_PREFIX}${roomId}`, {
		...state,
		players: JSON.stringify(state.players),
		playerUsernames: JSON.stringify(state.playerUsernames)
	});
}

export async function getRoomState(roomId: string): Promise<RoomState | null> {
	const redis = getRedis();
	const data = await redis.hgetall(
		`${WEBSOCKET_CONSTANTS.REDIS.KEYS.ROOM_PREFIX}${roomId}`
	);

	if (!data.id) return null;

	return {
		id: data.id,
		owner: data.owner,
		ownerUsername: data.ownerUsername,
		players: JSON.parse(data.players || "[]"),
		playerUsernames: JSON.parse(data.playerUsernames || "[]"),
		createdAt: parseInt(data.createdAt, 10),
		maxPlayers: parseInt(data.maxPlayers, 10)
	};
}

export async function removeRoomState(roomId: string): Promise<void> {
	const redis = getRedis();
	await redis.del(`${WEBSOCKET_CONSTANTS.REDIS.KEYS.ROOM_PREFIX}${roomId}`);
}

export async function getAllRoomStates(): Promise<RoomState[]> {
	const redis = getRedis();
	const keys = await redis.keys(
		`${WEBSOCKET_CONSTANTS.REDIS.KEYS.ROOM_PREFIX}*`
	);

	const rooms: RoomState[] = [];
	for (const key of keys) {
		const roomId = key.replace(WEBSOCKET_CONSTANTS.REDIS.KEYS.ROOM_PREFIX, "");
		const room = await getRoomState(roomId);
		if (room) rooms.push(room);
	}

	return rooms;
}

// Helper functions
export async function addUserToRoom(
	username: string,
	roomId: string
): Promise<boolean> {
	const room = await getRoomState(roomId);
	const userState = await getUserState(username);

	if (!room || !userState) return false;
	if (room.players.includes(userState.userId)) return false; // Already in room

	room.players.push(userState.userId);
	room.playerUsernames.push(username);
	await setRoomState(roomId, room);
	return true;
}

export async function removeUserFromRoom(
	username: string,
	roomId: string
): Promise<boolean> {
	const room = await getRoomState(roomId);
	const userState = await getUserState(username);

	if (!room || !userState) return false;

	// Remove user from arrays
	room.players = room.players.filter((id) => id !== userState.userId);
	room.playerUsernames = room.playerUsernames.filter(
		(name) => name !== username
	);

	if (room.players.length === 0) {
		await removeRoomState(roomId);
		return true;
	}

	// If owner left, transfer ownership to first remaining player
	if (room.owner === userState.userId && room.players.length > 0) {
		room.owner = room.players[0];
		room.ownerUsername = room.playerUsernames[0];
	}

	await setRoomState(roomId, room);
	return true;
}
