import { WebSocket } from "@fastify/websocket";

type Username = string;

export class PlayGame {
	private static instance: PlayGame;

	private socketByUsername: Record<Username, WebSocket>;

	static getInstance() {
		if (!PlayGame.instance) {
			PlayGame.instance = new PlayGame();
		}
		return PlayGame.instance;
	}

	constructor() {
		this.socketByUsername = {};
	}

	addUserToUsers(username: Username, socket: WebSocket) {
		this.socketByUsername[username] = socket;
	}

	removeUserFromUsers(username: Username) {
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
