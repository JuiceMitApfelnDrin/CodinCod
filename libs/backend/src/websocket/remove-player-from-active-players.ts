import { WebSocket } from "@fastify/websocket";

export function removePlayerFromActivePlayers({
	activePlayers,
	playerSocketToRemove
}: {
	activePlayers: WebSocket[];
	playerSocketToRemove: WebSocket;
}) {
	const socketIndex = activePlayers.findIndex((websocket) => websocket === playerSocketToRemove);

	if (socketIndex !== -1) {
		activePlayers.splice(socketIndex, 1);
	}
}
