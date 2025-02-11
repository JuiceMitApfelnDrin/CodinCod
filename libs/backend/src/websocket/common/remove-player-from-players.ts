import { MapUsernameToSocket } from "../waiting-room/waiting-room.js";
import { AuthenticatedInfo } from "types";

export async function removePlayerFromPlayers({
	players,
	user
}: {
	players: MapUsernameToSocket;
	user: AuthenticatedInfo;
}) {
	delete players[user.username];
}
