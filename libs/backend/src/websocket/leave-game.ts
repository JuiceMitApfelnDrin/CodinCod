import { GameEventEnum } from "types";
import { updatePlayer } from "./update-player.js";
import { updatePlayersInGame } from "./update-players-in-game.js";
import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";

export function leaveGame({
	gameId,
	socket,
	username,
	games
}: {
	gameId: string;
	socket: WebSocket;
	username: string;
	games: WebSocketGamesMap;
}) {
	// if game exists
	if (!games.has(gameId)) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${gameId}), couldn't be found`
		});
		return;
	}

	const game = games.get(gameId);

	if (!game) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${gameId}), couldn't be found`
		});
		return;
	}

	// remove user from game
	if (game.has(username)) {
		game.delete(username);
	}

	// if game is empty
	if (game.size === 0) {
		// remove game, since no longer in use
		games.delete(gameId);
	} else {
		const game = games.get(gameId);

		if (game) {
			// notify people someone left
			updatePlayersInGame({ game });
		}
	}
}
