import { WebSocket } from "@fastify/websocket";
import { updatePlayer } from "../common/update-player.js";
import { GameEvent, GameEventEnum } from "types";

export function updatePlayers({
	sockets,
	data,
	message,
	event = GameEventEnum.OVERVIEW_GAME
}: {
	sockets: WebSocket[];
	data?: any;
	event: GameEvent;
	message?: string;
}) {
	for (const socket of sockets) {
		updatePlayer({
			socket,
			event,
			data,
			message
		});
	}
}
