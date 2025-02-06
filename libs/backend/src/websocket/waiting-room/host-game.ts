import { joinGame } from "./join-game.js";
import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { GameEvent } from "types";
import mongoose from "mongoose";

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
	const randomId = new mongoose.Types.ObjectId().toString();

	games[randomId] = {};

	joinGame({ gameId: randomId, userId, socket, username, event, games });
}
