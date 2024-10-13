import { ValueOfGameEvent } from "types";
import { joinGame } from "./join-game.js";
import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { generateRandomObjectIdString } from "@/utils/functions/generate-random-object-id-string.js";

export function hostGame({
	userId,
	socket,
	username,
	event,
	games
}: {
	socket: WebSocket;
	event: ValueOfGameEvent;
	username: string;
	userId: string;
	games: WebSocketGamesMap;
}) {
	const randomId = generateRandomObjectIdString();

	games.set(randomId, new Map());

	joinGame({ gameId: randomId, userId, socket, username, event, games });
}
