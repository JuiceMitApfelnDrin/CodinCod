import { WebSocket } from "@fastify/websocket";

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

	updateAllUsers(data: string) {
		Object.values(this.socketByUsername).forEach((socket) => {
			socket.send(data);
		});
	}

	updateUser(username: string, data: string) {
		const socket = this.socketByUsername[username];

		if (!socket) {
			return;
		}

		socket.send(data);
	}
}
