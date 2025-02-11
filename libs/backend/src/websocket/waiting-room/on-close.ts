import { removePlayerFromPlayers } from "../common/remove-player-from-players.js";
import { OpenGames } from "@/types/games.js";
import { removeEmptyGames } from "./remove-empty-games.js";
import { AuthenticatedInfo } from "types";
import { removeStoppedPlayersFromGames } from "./remove-player-from-games.js";
import { MapUsernameToSocket } from "./waiting-room.js";

export async function onClose({
	players,
	games,
	user
}: {
	players: MapUsernameToSocket;
	code: number;
	reason: Buffer;
	games: OpenGames;
	user: AuthenticatedInfo;
}) {
	// TODO: when a player gets removed and is host/creator, move the ownership to second in line
	await Promise.all([
		removePlayerFromPlayers({
			players,
			user
		}),
		removeStoppedPlayersFromGames({ games, user }),
		removeEmptyGames({ games })
	]);
}
