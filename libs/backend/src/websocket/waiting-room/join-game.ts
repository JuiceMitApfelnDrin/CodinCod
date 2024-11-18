import { GameEvent, GameEventEnum } from "types";
import { updatePlayer } from "../common/update-player.js";
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

	// when a user tries to join the same game multiple times, possibly through a different tab
	if (game[username]) {
		return updatePlayer({
			socket,
			event: GameEventEnum.ALREADY_JOINED_GAME,
			message: "you already joined this game"
		});
	}

	// add a user to the game
	if (game) {
		game[username] = { joinedAt: new Date(), socket, userId, username };

		// notify people someone joined
		updatePlayer({ socket, event, message: gameId });
		updatePlayersInGame({ game });
	}
}
