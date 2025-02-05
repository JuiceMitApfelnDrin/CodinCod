import { WebSocket } from "@fastify/websocket";
import { removePlayerFromPlayers } from "./remove-player-from-players.js";
import { removeStoppedPlayersFromGames } from "./remove-player-from-games.js";
import { OpenGames } from "@/types/games.js";
import { removeEmptyGames } from "./remove-empty-games.js";

export async function onClose({
	players,
	playerSocketToRemove,
	code,
	reason,
	games
}: {
	players: WebSocket[];
	playerSocketToRemove: WebSocket;
	code: number;
	reason: Buffer;
	games: OpenGames;
}) {
	await Promise.all([
		removePlayerFromPlayers({
			players,
			playerSocketToRemove
		}),
	]);

	console.log({ reason, code });
}
