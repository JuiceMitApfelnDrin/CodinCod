import { WebSocket } from "@fastify/websocket";

export function addPlayerToPlayers({
	players,
	playerSocketToAdd
}: {
	players: WebSocket[];
	playerSocketToAdd: WebSocket;
}) {
	players.push(playerSocketToAdd);
}
