import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { updatePlayer } from "../common/update-player.js";
import { GameEventEnum } from "types";
import { removeGameFromGames } from "./remove-game-from-games.js";

export function updatePlayers({ sockets, games }: { sockets: WebSocket[]; games: OpenGames }) {
	const joinableGames = Object.entries(games).map(([key, game]) => {
		if (!game) {
			removeGameFromGames({ gameId: key, games });
			return { id: key, amountOfPlayersJoined: 0 };
		}

		return { id: key, amountOfPlayersJoined: Object.keys(game).length };
	});

	for (const socket of sockets) {
		updatePlayer({
			socket,
			event: GameEventEnum.OVERVIEW_OF_GAMES,
			data: joinableGames
		});
	}
}
