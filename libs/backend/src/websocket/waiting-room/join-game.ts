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

	if (!game) {
		return updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: "trying to join a game that either doesn't exist or is already on-going"
		});
	}

	// when a user tries to join the same game multiple times, possibly through a different tab
	if (game[username]) {
		return updatePlayer({
			socket,
			event: GameEventEnum.ALREADY_JOINED_GAME,
			message: "you already joined this game"
		});
	}

	// add a user to the game
	game[username] = { joinedAt: new Date(), socket, userId, username };

	// notify people someone joined
	updatePlayer({ socket, event, message: gameId });
	updatePlayersInGame({ game });
}
