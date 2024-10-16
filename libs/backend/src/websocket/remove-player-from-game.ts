import { OpenGame } from "@/types/games.js";

export function removePlayerFromGame({
	game,
	usernamePlayerToRemove
}: {
	game: OpenGame;
	usernamePlayerToRemove: string;
}) {
	delete game[usernamePlayerToRemove];
}
