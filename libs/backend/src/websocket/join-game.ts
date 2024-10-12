import { ValueOfGameEvent } from "types";
import { updatePlayer } from "./update-player.js";
import { updatePlayersInGame } from "./update-players-in-game.js";
import { WebSocketGamesMap } from "@/types/games.js";
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
	event: ValueOfGameEvent;
	username: string;
	userId: string;
	games: WebSocketGamesMap;
}) {
	const game = games.get(gameId);

	// add a user to the game
	if (game && username && userId) {
		game.set(username, { joinedAt: new Date(), socket, userId, username });

		// notify people someone joined
		updatePlayer({ socket, event, message: gameId });
		updatePlayersInGame({ game });
	}
}
