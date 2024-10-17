import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";

export function onConnection({
	players,
	newPlayerSocket,
	games
}: {
	players: WebSocket[];
	newPlayerSocket: WebSocket;
	games: OpenGames;
}) {
	
}
