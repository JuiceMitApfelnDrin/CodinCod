import { WebSocket } from "@fastify/websocket";
import { MapUsernameToSocket } from "../waiting-room/waiting-room.js";
import { AuthenticatedInfo } from "types";

export function addPlayerToPlayers({
	players,
	playerSocketToAdd,
	user
}: {
	players: MapUsernameToSocket;
	playerSocketToAdd: WebSocket;
	user: AuthenticatedInfo;
}) {
	players[user.username] = playerSocketToAdd;
}
