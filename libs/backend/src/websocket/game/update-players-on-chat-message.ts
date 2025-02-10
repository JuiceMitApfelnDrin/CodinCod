import { ChatMessage, GameEventEnum } from "types";
import { updatePlayers } from "./update-players.js";
import { WebSocket } from "@fastify/websocket";

export function updatePlayersOnChatMessage({
	chatMessage,
	players
}: {
	chatMessage: ChatMessage;
	players: WebSocket[];
}) {
	const updatedChatMessage: ChatMessage = {
		...chatMessage,
		createdAt: new Date().toISOString()
	};

	updatePlayers({
		sockets: players,
		event: GameEventEnum.SEND_MESSAGE,
		data: { chatMessage: updatedChatMessage }
	});
}
