import type { RoomState } from "./types.js";
import {
	setRoomState,
	getRoomState,
	removeRoomState,
	getAllRoomStates,
	addUserToRoom,
	removeUserFromRoom,
	getUserState,
	setUserState
} from "./state-manager.js";
import { publishEvent } from "./simple-event-bus.js";
import Game from "@/models/game/game.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import {
	DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
	GameEntity,
	GameModeEnum,
	GameVisibilityEnum,
	puzzleVisibilityEnum,
	frontendUrls
} from "types";
import { WEBSOCKET_CONSTANTS } from "@/config/constants.js";

// Create a new room
export async function createRoom(ownerUsername: string): Promise<string> {
	const roomId = generateRoomId();

	// Get owner's user ID
	const userState = await getUserState(ownerUsername);
	if (!userState) {
		throw new Error(`User ${ownerUsername} not found`);
	}

	const roomState: RoomState = {
		id: roomId,
		owner: userState.userId,
		ownerUsername: ownerUsername,
		players: [userState.userId],
		playerUsernames: [ownerUsername],
		createdAt: Date.now(),
		maxPlayers: WEBSOCKET_CONSTANTS.ROOM.DEFAULT_MAX_PLAYERS
	};

	await setRoomState(roomId, roomState);

	// Update user state
	userState.roomId = roomId;
	await setUserState(ownerUsername, userState);

	await publishEvent({
		type: "room",
		action: "created",
		roomId,
		username: ownerUsername,
		playerCount: 1
	});

	return roomId;
}

// Join a room
export async function joinRoom(
	username: string,
	roomId: string
): Promise<boolean> {
	const room = await getRoomState(roomId);
	if (!room) return false;

	if (room.players.length >= room.maxPlayers) return false;
	if (room.playerUsernames.includes(username)) return false; // Already in room

	const success = await addUserToRoom(username, roomId);
	if (!success) return false;

	// Update user state
	const userState = await getUserState(username);
	if (userState) {
		userState.roomId = roomId;
		await setUserState(username, userState);
	}

	await publishEvent({
		type: "room",
		action: "joined",
		roomId,
		username,
		playerCount: room.players.length + 1
	});

	return true;
}

// Leave a room
export async function leaveRoom(
	username: string,
	roomId: string
): Promise<boolean> {
	const room = await getRoomState(roomId);
	if (!room || !room.playerUsernames.includes(username)) return false;

	const success = await removeUserFromRoom(username, roomId);

	// Update user state
	const userState = await getUserState(username);
	if (userState) {
		userState.roomId = null;
		await setUserState(username, userState);
	}

	// Check if room was deleted (empty)
	const updatedRoom = await getRoomState(roomId);
	if (!updatedRoom) {
		await publishEvent({
			type: "room",
			action: "deleted",
			roomId,
			username
		});
	} else {
		await publishEvent({
			type: "room",
			action: "left",
			roomId,
			username,
			playerCount: updatedRoom.players.length
		});
	}

	return success;
}

// Get all rooms
export async function getAllRooms(): Promise<RoomState[]> {
	return await getAllRoomStates();
}

// Start a game from a room - creates actual MongoDB game
export async function startGame(
	roomId: string
): Promise<{ success: boolean; gameUrl?: string; error?: string }> {
	const room = await getRoomState(roomId);
	if (!room) {
		return { success: false, error: "Room not found" };
	}

	if (room.players.length === 0) {
		return { success: false, error: "No players in room" };
	}

	try {
		// Get a random approved puzzle
		const randomPuzzles = await Puzzle.aggregate([
			{ $match: { visibility: puzzleVisibilityEnum.APPROVED } },
			{ $sample: { size: 1 } }
		]).exec();

		if (randomPuzzles.length < 1) {
			return {
				success: false,
				error:
					"No approved puzzles available. Create and approve puzzles to play games."
			};
		}

		const randomPuzzle = randomPuzzles[0];
		const now = new Date();

		// Create the game entity for MongoDB
		const createGameEntity: GameEntity = {
			players: room.players, // These should be user IDs
			owner: room.owner, // This should be a user ID
			puzzle: randomPuzzle._id.toString(),
			createdAt: now,
			startTime: now,
			endTime: new Date(now.getTime() + DEFAULT_GAME_LENGTH_IN_MILLISECONDS),
			options: {
				allowedLanguages: [],
				maxGameDurationInSeconds: DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
				mode: GameModeEnum.RATED,
				visibility: GameVisibilityEnum.PUBLIC
			},
			playerSubmissions: []
		};

		// Save to MongoDB
		const databaseGame = new Game(createGameEntity);
		const newlyCreatedGame = await databaseGame.save();

		// Generate game URL
		const gameUrl = frontendUrls.multiplayerById(newlyCreatedGame.id);

		// Publish game started event
		await publishEvent({
			type: "game",
			action: "started",
			roomId,
			gameUrl,
			players: room.playerUsernames // Send usernames for the event
		});

		// Clean up: remove all players from room and delete room
		for (const username of room.playerUsernames) {
			const userState = await getUserState(username);
			if (userState) {
				userState.roomId = null;
				await setUserState(username, userState);
			}
		}

		await removeRoomState(roomId);

		return { success: true, gameUrl };
	} catch (error) {
		console.error("Failed to start game:", error);
		return { success: false, error: "Failed to create game" };
	}
}

// Helper
function generateRoomId(): string {
	return `${WEBSOCKET_CONSTANTS.ROOM.ID_PREFIX}${Math.random().toString(36).substring(2, WEBSOCKET_CONSTANTS.ROOM.ID_LENGTH)}`;
}
