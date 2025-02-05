import { GameId, OpenGames } from "@/types/games.js";

export function removeGameFromGames({ gameId, games }: { gameId: GameId; games: OpenGames }) {
	delete games[gameId];
}
