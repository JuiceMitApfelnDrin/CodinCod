import { OpenGames } from "@/types/games.js";
import { removeGameFromGames } from "./remove-game-from-games.js";

export async function removeEmptyGames({ games }: { games: OpenGames }) {
	Object.entries(games).filter(([gameId, openGame]) => {
		if (Object.keys(openGame).length <= 0) {
			removeGameFromGames({ gameId, games });
		}
	});
}
