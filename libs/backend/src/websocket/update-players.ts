import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { updatePlayer } from "./update-player.js";
import { GameEventEnum } from "types";

export function updatePlayers({
	sockets,
	games
}: {
	sockets: WebSocket[];
	games: WebSocketGamesMap;
}) {
	const joinableGames = Array.from(games.entries(), ([key, value]) => {
		return { id: key, amountOfPlayersJoined: value.size };
	});

	for (const socket of sockets) {
		updatePlayer({ socket, event: GameEventEnum.OVERVIEW_OF_GAMES, message: joinableGames });
	}
}
