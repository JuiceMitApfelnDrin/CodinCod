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

export class WaitingRoom {
	private roomsByRoomId: Record<RoomId, Room>;
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

	hostRoom(user: AuthenticatedInfo): RoomId {
		const randomId = new mongoose.Types.ObjectId().toString();

		this.roomsByRoomId[randomId] = {
			[user.username]: {
				joinedAt: new Date(),
				userId: user.userId,
				username: user.username
			}
		};

		this.joinRoom(user, randomId);
		return randomId;
	}

	joinRoom(user: AuthenticatedInfo, roomId: RoomId): boolean {
		const room = this.getRoom(roomId);
		if (!room) {
			console.warn(
				`Room ${roomId} not found when user ${user.username} tried to join`
			);
			return false;
		}

		room[user.username] = {
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
		const room = this.getRoom(roomId);
		if (!room) {
			console.warn(
				`Room ${roomId} not found when user ${username} tried to leave`
			);
			return;
		}

		delete room[username];
		delete this.roomsByUsername[username];
		console.info(
			`User ${username} left room ${roomId}. Remaining players: ${Object.keys(room).length}`
		);

		if (Object.keys(room).length <= 0) {
			delete this.roomsByRoomId[roomId];
			console.info(`Room ${roomId} is now empty and removed`);
		} else {
			this.updateUsersOnRoomState(roomId);
		}
	}

	getRoom(roomId: RoomId): Room | undefined {
		return this.roomsByRoomId[roomId];
	}

	getRooms(): Array<{ roomId: RoomId; amountOfPlayersJoined: number }> {
		return Object.entries(this.roomsByRoomId).map(([roomId, room]) => {
			return { roomId, amountOfPlayersJoined: Object.keys(room).length };
		});
	}

	getAllRoomIds(): RoomId[] {
		return Object.keys(this.roomsByRoomId);
	}

	updateUsersOnRoomState(roomId: RoomId): void {
		const room = this.getRoom(roomId);
		if (!room) {
			return;
		}

		const usersInRoom = Object.values(room);
		this.updateUsersInRoom(roomId, {
			event: waitingRoomEventEnum.OVERVIEW_ROOM,
			room: {
				users: usersInRoom,
				owner: this.findRoomOwner(room),
				roomId
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
			.filter(([_roomId, room]) => Object.keys(room).length === 0)
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
