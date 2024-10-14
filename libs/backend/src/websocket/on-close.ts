import { WebSocket } from "@fastify/websocket";
import { removePlayerFromPlayers } from "./remove-player-from-players.js";
import { removePlayerFromGames } from "./remove-player-from-games.js";
import { WebSocketGamesMap } from "@/types/games.js";

export function onClose({
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
	games: WebSocketGamesMap;
}) {
	removePlayerFromPlayers({
		players,
		playerSocketToRemove
	});

	removePlayerFromGames({ games, socketToRemove: playerSocketToRemove });

	console.log({ code, reason: reason.toString() });
}
