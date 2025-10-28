import { WebSocket } from "@fastify/websocket";
import mongoose from "mongoose";
import {
	AuthenticatedInfo,
	GameUserInfo,
	ObjectId,
	waitingRoomEventEnum,
	WaitingRoomResponse
} from "types";
import { ConnectionManager } from "../connection-manager.js";

type Username = string;
type RoomId = ObjectId;
type Room = Record<Username, GameUserInfo>;

// Custom type for room options to work with exactOptionalPropertyTypes
export type RoomGameOptions = {
	allowedLanguages?:
		| Array<
				| string
				| {
						language: string;
						version: string;
						aliases: string[];
						_id?: string | undefined;
						runtime?: string | undefined;
				  }
		  >
		| undefined;
	maxGameDurationInSeconds?: number | undefined;
	visibility?: ("private" | "public") | undefined;
	mode?: ("fastest" | "shortest" | "rated" | "casual") | undefined;
};

interface RoomConfig {
	users: Room;
	options?: RoomGameOptions | undefined;
	inviteCode?: string | undefined;
}

export class WaitingRoom {
	private roomsByRoomId: Record<RoomId, RoomConfig>;
	private roomsByUsername: Record<Username, RoomId>;
	private connectionManager: ConnectionManager;

	constructor() {
		this.roomsByRoomId = {};
		this.roomsByUsername = {};
		this.connectionManager = new ConnectionManager({
			onConnectionLost: (username) => {
				this.handleDisconnectedUser(username);
			}
		});
	}

	private handleDisconnectedUser(username: Username): void {
		console.info(`Waiting room connection lost for user: ${username}`);
		const roomId = this.roomsByUsername[username];
		if (roomId) {
			this.leaveRoom(username, roomId);
		}
		this.removeEmptyRooms();
	}

	addUserToUsers(
		username: Username,
		socket: WebSocket,
		user: AuthenticatedInfo
	): void {
		this.connectionManager.add(user, socket);
	}

	removeUserFromUsers(username: Username): void {
		const roomId = this.roomsByUsername[username];
		if (roomId) {
			this.leaveRoom(username, roomId);
		}
		this.connectionManager.remove(username);
	}

	hostRoom(user: AuthenticatedInfo, options?: RoomGameOptions): RoomId {
		const randomId = new mongoose.Types.ObjectId().toString();

		// Generate a 6-character invite code for private rooms
		let inviteCode: string | undefined;
		if (options?.visibility === "private") {
			inviteCode = this.generateInviteCode();
		}

		this.roomsByRoomId[randomId] = {
			users: {
				[user.username]: {
					joinedAt: new Date(),
					userId: user.userId,
					username: user.username
				}
			},
			options,
			inviteCode
		};

		this.joinRoom(user, randomId);
		return randomId;
	}

	private generateInviteCode(): string {
		// Generate a random 6-character code using uppercase letters and numbers
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let code = "";
		for (let i = 0; i < 6; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return code;
	}

	joinRoom(user: AuthenticatedInfo, roomId: RoomId): boolean {
		const roomConfig = this.roomsByRoomId[roomId];
		if (!roomConfig) {
			console.warn(
				`Room ${roomId} not found when user ${user.username} tried to join`
			);
			return false;
		}

		roomConfig.users[user.username] = {
			joinedAt: new Date(),
			userId: user.userId,
			username: user.username
		};

		this.roomsByUsername[user.username] = roomId;
		console.info(`User ${user.username} joined room ${roomId}`);
		this.updateUsersOnRoomState(roomId);
		return true;
	}

	leaveRoom(username: Username, roomId: RoomId): void {
		const roomConfig = this.roomsByRoomId[roomId];
		if (!roomConfig) {
			console.warn(
				`Room ${roomId} not found when user ${username} tried to leave`
			);
			return;
		}

		delete roomConfig.users[username];
		delete this.roomsByUsername[username];
		console.info(
			`User ${username} left room ${roomId}. Remaining players: ${Object.keys(roomConfig.users).length}`
		);

		if (Object.keys(roomConfig.users).length <= 0) {
			delete this.roomsByRoomId[roomId];
			console.info(`Room ${roomId} is now empty and removed`);
		} else {
			this.updateUsersOnRoomState(roomId);
		}
	}

	getRoom(roomId: RoomId): Room | undefined {
		const roomConfig = this.roomsByRoomId[roomId];
		return roomConfig?.users;
	}

	getRoomOptions(roomId: RoomId): RoomGameOptions | undefined {
		return this.roomsByRoomId[roomId]?.options;
	}

	getRooms(): Array<{ roomId: RoomId; amountOfPlayersJoined: number }> {
		// Only return public rooms
		return Object.entries(this.roomsByRoomId)
			.filter(([_roomId, roomConfig]) => {
				return roomConfig.options?.visibility !== "private";
			})
			.map(([roomId, roomConfig]) => {
				return {
					roomId,
					amountOfPlayersJoined: Object.keys(roomConfig.users).length
				};
			});
	}

	getRoomByInviteCode(inviteCode: string): RoomId | undefined {
		const entry = Object.entries(this.roomsByRoomId).find(
			([_roomId, roomConfig]) => roomConfig.inviteCode === inviteCode
		);
		return entry?.[0];
	}

	getInviteCode(roomId: RoomId): string | undefined {
		return this.roomsByRoomId[roomId]?.inviteCode;
	}

	getAllRoomIds(): RoomId[] {
		return Object.keys(this.roomsByRoomId);
	}

	updateUsersOnRoomState(roomId: RoomId): void {
		const room = this.getRoom(roomId);
		const inviteCode = this.getInviteCode(roomId);
		if (!room) {
			return;
		}

		const usersInRoom = Object.values(room);
		this.updateUsersInRoom(roomId, {
			event: waitingRoomEventEnum.OVERVIEW_ROOM,
			room: {
				users: usersInRoom,
				owner: this.findRoomOwner(room),
				roomId,
				...(inviteCode && { inviteCode })
			}
		});
	}

	findRoomOwner(room: Room): GameUserInfo {
		const usersInRoom = Object.values(room);
		return usersInRoom.sort((userA, userB) => {
			const userAJoinDate = new Date(userA.joinedAt).getTime();
			const userBJoinDate = new Date(userB.joinedAt).getTime();
			return userAJoinDate - userBJoinDate;
		})[0];
	}

	updateUsersInRoom(roomId: RoomId, response: WaitingRoomResponse): void {
		const room = this.getRoom(roomId);
		if (!room) {
			return;
		}

		Object.keys(room).forEach((username) => {
			this.updateUser(username, response);
		});
	}

	updateAllUsers(response: WaitingRoomResponse): void {
		const usernames = this.connectionManager.getAllUsernames();
		usernames.forEach((username) => {
			this.updateUser(username, response);
		});
	}

	updateUser(username: string, response: WaitingRoomResponse): boolean {
		return this.connectionManager.send(username, response);
	}

	removeEmptyRooms(): void {
		const emptyRoomIds = Object.entries(this.roomsByRoomId)
			.filter(
				([_roomId, roomConfig]) => Object.keys(roomConfig.users).length === 0
			)
			.map(([roomId]) => roomId);

		emptyRoomIds.forEach((roomId) => {
			console.info(`Removing empty room: ${roomId}`);
			delete this.roomsByRoomId[roomId];
		});

		if (emptyRoomIds.length > 0) {
			console.info(`Removed ${emptyRoomIds.length} empty rooms`);
		}
	}

	dissolveRoom(roomId: RoomId): void {
		const room = this.getRoom(roomId);
		if (!room) return;

		const usernames = Object.keys(room);

		usernames.forEach((username) => {
			delete this.roomsByUsername[username];
		});
		delete this.roomsByRoomId[roomId];

		usernames.forEach((username) => {
			this.connectionManager.remove(username);
		});

		console.info(`Dissolved room ${roomId} with ${usernames.length} users`);
	}

	isUserConnected(username: Username): boolean {
		return this.connectionManager.isConnected(username);
	}

	destroy(): void {
		this.connectionManager.destroy();
	}
}
