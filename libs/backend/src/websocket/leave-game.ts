import { GameEventEnum, ValueOfGameEvent } from "types";
import { updatePlayer } from "./update-player.js";
import { updatePlayersInGame } from "./update-players-in-game.js";
import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";

export function leaveGame({
	gameId,
	socket,
	username,
	event,
	games
}: {
	gameId: string;
	socket: WebSocket;
	event: ValueOfGameEvent;
	username: string;
	games: WebSocketGamesMap;
}) {
	// if game exists
	if (games.has(gameId)) {
		// remove user from game
		const game = games.get(gameId);

		if (!game) {
			updatePlayer({ socket, event: GameEventEnum.NONEXISTENT_GAME, message: "no game yo!" });
			return;
		}

		if (username && game.has(username)) {
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
				updatePlayer({ socket, event, message: "cya!" });
				updatePlayersInGame(game);
			}
		}
	}
}
