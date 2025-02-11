import { OpenGame } from "@/types/games.js";
import { AuthenticatedInfo } from "types";

export function removePlayerFromGame({ game, user }: { game: OpenGame; user: AuthenticatedInfo }) {
	delete game[user.username];
}
