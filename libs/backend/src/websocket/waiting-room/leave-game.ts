import { GameEventEnum } from "types";
import { updatePlayer } from "../common/update-player.js";
import { updatePlayersInGame } from "./update-players-in-game.js";
import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { removePlayerFromGame } from "./remove-player-from-game.js";
import { removeGameFromGames } from "./remove-game-from-games.js";

export function leaveGame({
	gameId,
	socket,
	username,
	games
}: {
	gameId: string;
	socket: WebSocket;
	username: string;
	games: OpenGames;
}) {
	const game = games[gameId];

	// if game exists
	if (!game) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${gameId}), couldn't be found`
		});
		return;
	}

	const userInfo = game[username];

	if (userInfo) {
		removePlayerFromGame({ game, usernamePlayerToRemove: username });
	}

	// if game is empty
	if (Object.keys(game).length === 0) {
		// no longer in use
		removeGameFromGames({ gameId, games });
	} else {
		const game = games[gameId];

		if (game) {
			// notify people someone left
			updatePlayersInGame({ game });
		}
	}
}
