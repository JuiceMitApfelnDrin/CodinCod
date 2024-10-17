import { WebSocket } from "@fastify/websocket";
import { GameEvent } from "types";

export function updatePlayer({
	socket,
	event,
	message
}: {
	socket: WebSocket;
	event: GameEvent;
	message: string;
}) {
	socket.send(
		JSON.stringify({
			event,
			message
		})
	);
}
