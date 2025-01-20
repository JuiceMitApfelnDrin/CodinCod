import { WebSocket } from "@fastify/websocket";
import { GameEvent } from "types";

export function updatePlayer({
	socket,
	event,
	message,
	data
}: {
	socket: WebSocket;
	event: GameEvent;
	message?: string;
	data?: any;
}) {
	socket.send(
		JSON.stringify({
			event,
			message,
			data
		})
	);
}
