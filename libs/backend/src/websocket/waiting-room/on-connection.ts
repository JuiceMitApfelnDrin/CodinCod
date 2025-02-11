import { OpenGames } from "@/types/games.js";
import { addPlayerToPlayers } from "../common/add-player-to-players.js";
import { updatePlayers } from "./update-players.js";
import { WebSocket } from "@fastify/websocket";
import { MapUsernameToSocket } from "./waiting-room.js";
import { AuthenticatedInfo } from "types";

export function onConnection({
	players,
	newPlayerSocket,
	games,
	user
}: {
	players: MapUsernameToSocket;
	newPlayerSocket: WebSocket;
	games: OpenGames;
	user: AuthenticatedInfo;
}) {
	addPlayerToPlayers({ players: players, playerSocketToAdd: newPlayerSocket, user });

	const singleUserToUpdate = { [user.username]: newPlayerSocket };
	updatePlayers({ sockets: singleUserToUpdate, games });
}
