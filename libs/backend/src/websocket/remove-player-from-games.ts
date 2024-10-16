import { OpenGames } from "@/types/games.js";
import { removePlayerFromGame } from "./remove-player-from-game.js";
import { GameUserInfo } from "types";

export async function removeStoppedPlayersFromGames({ games }: { games: OpenGames }) {
	// TODO: is it safe to stop when you have removed only one item, who is to say someone may join multiple through an unofficial client?
	// looking at you :susge:
	Object.values(games).forEach((game) => {
		Object.values(game).filter((gameUserObj: GameUserInfo) => {
			if (!gameUserObj.socket || gameUserObj.socket.CLOSED) {
				removePlayerFromGame({ game, usernamePlayerToRemove: gameUserObj.username });
			}
		});
	});
}
