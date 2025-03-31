import { WebSocket } from "@fastify/websocket";
import { AuthenticatedInfo, waitingRoomEventEnum } from "types";
import { WaitingRoom } from "./waiting-room.js";

export function onConnection(waitingRoom: WaitingRoom, socket: WebSocket, user: AuthenticatedInfo) {
	waitingRoom.addUserToUsers(user.username, socket);

	const openRooms = waitingRoom.getRooms();

	waitingRoom.updateUser(user.username, {
		event: waitingRoomEventEnum.OVERVIEW_OF_ROOMS,
		rooms: openRooms
	});
}
