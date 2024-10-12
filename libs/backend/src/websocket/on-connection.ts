import { WebSocketGamesMap } from "@/types/games.js";
import { addPlayerToActivePlayers } from "./add-player-to-active-players.js";
import { updateActivePlayers } from "./update-active-players.js";
import { WebSocket } from "@fastify/websocket";

export function onConnection({
	activePlayers,
	newPlayerSocket,
	games
}: {
	activePlayers: WebSocket[];
	newPlayerSocket: WebSocket;
	games: WebSocketGamesMap;
}) {
	addPlayerToActivePlayers({ activePlayers: activePlayers, playerSocketToAdd: newPlayerSocket });
	updateActivePlayers({ sockets: [newPlayerSocket], games });
}
