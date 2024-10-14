import { WebSocketGamesMap } from "@/types/games.js";
import { removePlayerFromGame } from "./remove-player-from-game.js";
import { WebSocket } from "@fastify/websocket";

export async function removePlayerFromGames({
	games,
	socketToRemove
}: {
	games: WebSocketGamesMap;
	socketToRemove: WebSocket;
}) {
	// TODO: is it safe to stop when you have removed only one item, who is to say someone may join multiple through an unofficial client?
	// looking at you :susge:
	games.forEach((game) => {
		const itemToRemove = game.entries().find(([_, gameUserObj]) => {
			return gameUserObj.socket === socketToRemove;
		});

		if (itemToRemove) {
			const [username, _] = itemToRemove;

			removePlayerFromGame({ game, usernamePlayerToRemove: username });
		}
	});
}
