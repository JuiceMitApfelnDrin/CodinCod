import { WebSocket } from "@fastify/websocket";
import mongoose from "mongoose";
import {
	AuthenticatedInfo,
	GameUserInfo,
	ObjectId,
	waitingRoomEventEnum,
	WaitingRoomResponse
} from "types";

type Username = string;
type RoomId = ObjectId;
type Room = Record<Username, GameUserInfo>;

export class WaitingRoom {
	private roomsByRoomId: Record<RoomId, Room>;
	private socketByUsername: Record<Username, WebSocket>;
	private roomsByUsername: Record<Username, RoomId>;

	constructor() {
		this.roomsByRoomId = {};
		this.socketByUsername = {};
		this.roomsByUsername = {};
	}

	addUserToUsers(username: Username, socket: WebSocket) {
		this.socketByUsername[username] = socket;
	}

	removeUserFromUsers(username: Username) {
		const roomId = this.roomsByUsername[username];

		if (roomId) {
			this.leaveRoom(username, roomId);
		}

		delete this.socketByUsername[username];
	}

	hostRoom(user: AuthenticatedInfo) {
		const randomId = new mongoose.Types.ObjectId().toString();

		// make the room
		this.roomsByRoomId[randomId] = {
			[user.username]: {
				joinedAt: new Date(),
				userId: user.userId,
				username: user.username
			}
		};

		this.joinRoom(user, randomId);
	}

	joinRoom(user: AuthenticatedInfo, roomId: RoomId) {
		const room = this.getRoom(roomId);

		if (!room) {
			return;
		}

		room[user.username] = {
			joinedAt: new Date(),
			userId: user.userId,
			username: user.username
		};

		this.roomsByUsername[user.username] = roomId;

		this.updateUsersOnRoomState(roomId);
	}

	leaveRoom(username: Username, roomId: RoomId) {
		const room = this.getRoom(roomId);

		if (!room) {
			return;
		}

		delete room[username];

		if (Object.keys(room).length <= 0) {
			delete this.roomsByRoomId[roomId];
		}

		this.updateUsersOnRoomState(roomId);
	}

	getRoom(roomId: RoomId) {
		return this.roomsByRoomId[roomId];
	}

	getRooms() {
		return Object.entries(this.roomsByRoomId).map(([roomId, room]) => {
			return { roomId, amountOfPlayersJoined: Object.keys(room).length };
		});
	}

	updateUsersOnRoomState(roomId: RoomId) {
		const room = this.getRoom(roomId);

		if (!room) {
			return;
		}

		const usersInRoom = Object.values(room);

		this.updateUsersInRoom(roomId, {
			event: waitingRoomEventEnum.OVERVIEW_ROOM,
			room: {
				users: usersInRoom,
				owner: usersInRoom.sort((userA, userB) => {
					const userAJoinDate = new Date(userA.joinedAt).getTime();
					const userBJoinDate = new Date(userB.joinedAt).getTime();

					return userAJoinDate - userBJoinDate;
				})[0],
				roomId
			}
		});
	}

	updateUsersInRoom(roomId: RoomId, data: WaitingRoomResponse) {
		const room = this.getRoom(roomId);

		if (!room) {
			return;
		}

		Object.keys(room).forEach((username) => {
			this.updateUser(username, data);
		});
	}

	updateAllUsers(data: string) {
		Object.values(this.socketByUsername).forEach((socket) => {
			socket.send(data);
		});
	}

	updateUser(username: string, data: WaitingRoomResponse) {
		const socket = this.socketByUsername[username];

		if (!socket) {
			return;
		}

		const stringData = JSON.stringify(data);

		socket.send(stringData);
	}

	removeEmptyRooms() {
		const rooms = Object.entries(this.roomsByRoomId).filter(([_roomId, room]) => {
			return Object.keys(room).length === 0;
		});

		rooms.forEach(([roomId, _room]) => {
			delete this.roomsByRoomId[roomId];
		});
	}
}
