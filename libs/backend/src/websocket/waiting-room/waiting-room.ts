import { WebSocket } from "@fastify/websocket";
import { onConnection } from "./on-connection.js";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onMessage } from "./on-message.js";
import { updatePlayers } from "./update-players.js";
import { onClose } from "./on-close.js";
import { AuthenticatedInfo, GameUserInfo, isAuthenticatedInfo } from "types";
import mongoose from "mongoose";

type Username = string;
type RoomId = string;
type Room = Record<Username, GameUserInfo>;

class WaitingRoom {
	roomsByRoomId: Record<RoomId, Room>;
	socketByUsername: Record<Username, WebSocket>;
	roomsByUsername: Record<Username, RoomId[]>;

	constructor() {
		this.roomsByRoomId = {};
		this.socketByUsername = {};
		this.roomsByUsername = {};
	}

	addUserToUsers(user: AuthenticatedInfo, socket: WebSocket) {
		this.socketByUsername[user.username] = socket;
	}

	removeUserFromUsers(user: AuthenticatedInfo) {
		const roomIds = this.roomsByUsername[user.username];

		roomIds.forEach((roomId) => {
			this.leaveRoom(user, roomId);
		});

		delete this.socketByUsername[user.username];
	}

	hostRoom(user: AuthenticatedInfo) {
		const randomId = new mongoose.Types.ObjectId().toString();
		// make the room
		this.roomsByRoomId[randomId] = {};

		this.joinRoom(user, randomId);
	}

	joinRoom(user: AuthenticatedInfo, roomId: string) {
		const room = this.roomsByRoomId[roomId];

		room[user.username] = {
			joinedAt: new Date(),
			userId: user.userId,
			username: user.username
		};
	}

	leaveRoom(user: AuthenticatedInfo, roomId: string) {
		const room = this.roomsByRoomId[roomId];

		delete room[user.username];

		if (Object.keys(room).length <= 0) {
			delete this.roomsByRoomId[roomId];
		}
	}

	getRoom(roomId: string) {
		return this.roomsByRoomId[roomId];
	}

	updateUsersInRoom(roomId: string, data: string) {
		const room = this.roomsByRoomId[roomId];

		Object.keys(room).forEach((username) => {
			this.updateUser(username, data);
		});
	}

	updateAllUsers(data: string) {
		Object.values(this.socketByUsername).forEach((socket) => {
			socket.send(data);
		});
	}

	updateUser(username: string, data: string) {
		const socket = this.socketByUsername[username];

		socket.send(data);
	}
}

const waitingRoomObj = new WaitingRoom();

export function waitingRoom(socket: WebSocket, req: FastifyRequest, fastify: FastifyInstance) {
	if (!isAuthenticatedInfo(req.user)) {
		return;
	}
	onConnection({ players: socketByUsername, games, newPlayerSocket: socket, user: req.user });

	socket.on("message", (message) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		onMessage({
			message,
			games,
			socket,
			players: socketByUsername,
			user: req.user,
			gamesByUsername
		});
		updatePlayers({ sockets: socketByUsername, games });
	});

	socket.on("close", (code, reason) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		onClose({
			code,
			reason,
			players: socketByUsername,
			games,
			user: req.user
		});
	});
}
