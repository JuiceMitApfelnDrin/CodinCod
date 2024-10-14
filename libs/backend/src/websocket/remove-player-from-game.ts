import { WebSocketGame } from "@/types/games.js";

export function removePlayerFromGame({
	game,
	usernamePlayerToRemove
}: {
	game: WebSocketGame;
	usernamePlayerToRemove: string;
}) {
	game.delete(usernamePlayerToRemove);
}
