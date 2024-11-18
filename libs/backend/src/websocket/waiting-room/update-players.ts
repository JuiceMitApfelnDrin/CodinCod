import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { updatePlayer } from "../common/update-player.js";
import { GameEventEnum } from "types";

export function updatePlayers({ sockets, games }: { sockets: WebSocket[]; games: OpenGames }) {
	const joinableGames = Object.entries(games).map(([key, value]) => {
		return { id: key, amountOfPlayersJoined: Object.keys(value).length };
	});

	for (const socket of sockets) {
		updatePlayer({
			socket,
			event: GameEventEnum.OVERVIEW_OF_GAMES,
			data: joinableGames
		});
	}
}
