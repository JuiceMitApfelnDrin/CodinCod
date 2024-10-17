import { OpenGames } from "@/types/games.js";
import { addPlayerToPlayers } from "./add-player-to-players.js";
import { updatePlayers } from "./update-players.js";
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
	addPlayerToPlayers({ players: players, playerSocketToAdd: newPlayerSocket });
	updatePlayers({ sockets: [newPlayerSocket], games });
}
