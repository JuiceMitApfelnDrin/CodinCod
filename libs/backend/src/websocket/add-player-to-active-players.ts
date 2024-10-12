import { WebSocket } from "@fastify/websocket";

export function addPlayerToActivePlayers({
	activePlayers,
	playerSocketToAdd
}: {
	activePlayers: WebSocket[];
	playerSocketToAdd: WebSocket;
}) {
	activePlayers.push(playerSocketToAdd);
}
