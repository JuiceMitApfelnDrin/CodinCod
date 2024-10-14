import { WebSocket } from "@fastify/websocket";

export function removePlayerFromPlayers({
	players,
	playerSocketToRemove
}: {
	players: WebSocket[];
	playerSocketToRemove: WebSocket;
}) {
	const socketIndex = players.findIndex((websocket) => websocket === playerSocketToRemove);

	if (socketIndex !== -1) {
		players.splice(socketIndex, 1);
	}
}
