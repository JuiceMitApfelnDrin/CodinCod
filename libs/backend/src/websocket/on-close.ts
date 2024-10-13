import { WebSocket } from "@fastify/websocket";
import { removePlayerFromPlayers } from "./remove-player-from-active-players.js";

export function onClose({
	players,
	playerSocketToRemove,
	code,
	reason
}: {
	players: WebSocket[];
	playerSocketToRemove: WebSocket;
	code: number;
	reason: Buffer;
}) {
	removePlayerFromPlayers({
		players,
		playerSocketToRemove
	});

	console.log({ code, reason: reason.toString() });
}
