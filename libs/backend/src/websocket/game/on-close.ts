import { WebSocket } from "@fastify/websocket";
import { removePlayerFromPlayers } from "../common/remove-player-from-players.js";

export async function onClose({
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
	// TODO: when a player gets removed and is host/creator, move the ownership to second in line
	await Promise.all([
		removePlayerFromPlayers({
			players,
			playerSocketToRemove
		})
	]);

	console.log({ reason, code });
}
