import { WebSocket } from "@fastify/websocket";
import { GameResponse } from "types";

type Username = string;

export class UserWebSockets {
	private socketByUsername: Record<Username, WebSocket>;

	constructor() {
		this.socketByUsername = {};
	}

	add(username: Username, socket: WebSocket) {
		this.socketByUsername[username] = socket;
	}

	remove(username: Username) {
		delete this.socketByUsername[username];
	}

	updateAllUsers(response: GameResponse) {
		Object.keys(this.socketByUsername).forEach((username) => {
			this.updateUser(username, response);
		});
	}

	updateUser(username: string, response: GameResponse) {
		const socket = this.socketByUsername[username];

		if (!socket) {
			return;
		}

		const data = JSON.stringify(response);

		socket.send(data);
	}
}
