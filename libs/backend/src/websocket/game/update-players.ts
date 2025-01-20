import { WebSocket } from "@fastify/websocket";
import { updatePlayer } from "../common/update-player.js";
import { GameEventEnum } from "types";

export function updatePlayers({
	sockets,
	data,
	message
}: {
	sockets: WebSocket[];
	data?: any;
	message?: string;
}) {
	for (const socket of sockets) {
		updatePlayer({
			socket,
			event: GameEventEnum.OVERVIEW_GAME,
			data,
			message
		});
	}
}
