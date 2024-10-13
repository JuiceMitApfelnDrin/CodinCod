import { WebSocketGamesMap } from "@/types/games.js";
import { addPlayerToPlayers } from "./add-player-to-active-players.js";
import { updatePlayers } from "./update-active-players.js";
import { WebSocket } from "@fastify/websocket";

export function onConnection({
	players,
	newPlayerSocket,
	games
}: {
	players: WebSocket[];
	newPlayerSocket: WebSocket;
	games: WebSocketGamesMap;
}) {
	addPlayerToPlayers({ players: players, playerSocketToAdd: newPlayerSocket });
	updatePlayers({ sockets: [newPlayerSocket], games });
}
