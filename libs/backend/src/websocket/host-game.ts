import { joinGame } from "./join-game.js";
import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { generateRandomObjectIdString } from "@/utils/functions/generate-random-object-id-string.js";
import { GameEvent } from "types";

export function hostGame({
	userId,
	socket,
	username,
	event,
	games
}: {
	socket: WebSocket;
	event: GameEvent;
	username: string;
	userId: string;
	games: OpenGames;
}) {
	const randomId = generateRandomObjectIdString();

	games[randomId] = {};

	joinGame({ gameId: randomId, userId, socket, username, event, games });
}
