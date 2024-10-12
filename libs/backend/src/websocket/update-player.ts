import { WebSocket } from "@fastify/websocket";
import { ValueOfGameEvent } from "types";

export function updatePlayer({
	socket,
	event,
	message
}: {
	socket: WebSocket;
	event: ValueOfGameEvent;
	message: any;
}) {
	socket.send(
		JSON.stringify({
			event,
			message
		})
	);
}
