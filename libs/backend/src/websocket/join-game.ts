import { GameEvent } from "types";
import { updatePlayer } from "./update-player.js";
import { updatePlayersInGame } from "./update-players-in-game.js";
import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";

export function joinGame({
	gameId,
	userId,
	socket,
	username,
	event,
	games
}: {
	gameId: string;
	socket: WebSocket;
	event: GameEvent;
	username: string;
	userId: string;
	games: OpenGames;
}) {
	const game = games[gameId];

	// add a user to the game
	if (game && username && userId) {
		game[username] = { joinedAt: new Date(), socket, userId, username };

		// notify people someone joined
		updatePlayer({ socket, event, message: gameId });
		updatePlayersInGame({ game });
	}
}
