import { WebSocket } from "@fastify/websocket";
import { removePlayerFromActivePlayers } from "./remove-player-from-active-players.js";

export function onClose({
	activePlayers,
	playerSocketToRemove,
	code,
	reason
}: {
	activePlayers: WebSocket[];
	playerSocketToRemove: WebSocket;
	code: number;
	reason: Buffer;
}) {
	removePlayerFromActivePlayers({
		activePlayers,
		playerSocketToRemove
	});

	console.log({ code, reason: reason.toString() });
}
