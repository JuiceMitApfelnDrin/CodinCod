import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { RawData } from "ws";

export async function onMessage({
	message,
	socket,
	games,
	players
}: {
	message: RawData;
	socket: WebSocket;
	games: OpenGames;
	players: WebSocket[];
}) {}
