import { OpenGames } from "@/types/games.js";
import { removePlayerFromGame } from "./remove-player-from-game.js";
import { AuthenticatedInfo, GameUserInfo } from "types";
import { updatePlayersInGame } from "./update-players-in-game.js";

export async function removeStoppedPlayersFromGames({
	games,
	user
}: {
	games: OpenGames;
	user: AuthenticatedInfo;
}) {
	Object.values(games).forEach((game) => {
		if (game) {
			Object.values(game).forEach((gameUserObj: GameUserInfo) => {
				if (gameUserObj.username == user.username) {
				}
			});
		}
	});

	removePlayerFromGame({ game, user });

	if (Object.values(game).length > 0) {
		updatePlayersInGame({ game });
	}
}
