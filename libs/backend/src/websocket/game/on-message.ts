import { parseRawDataMessage } from "@/utils/functions/parse-raw-data-message.js";
import { WebSocket } from "@fastify/websocket";
import { GameEventEnum, isChatMessage } from "types";
import { RawData } from "ws";
import { updatePlayersOnGameState } from "./update-players-on-game-state.js";
import { updatePlayersOnChatMessage } from "./update-players-on-chat-message.js";
import { FastifyInstance } from "fastify";
import { updatePlayer } from "../common/update-player.js";

export async function onMessage({
	message,
	socket,
	id,
	players
}: {
	message: RawData;
	socket: WebSocket;
	players: WebSocket[];
	id: string;
	fastify: FastifyInstance;
}) {
	let parsedMessage = parseRawDataMessage(message, socket);

	if (!parsedMessage) {
		return;
	}

	const { event } = parsedMessage;

	switch (event) {
		case GameEventEnum.SUBMITTED_PLAYER:
			updatePlayersOnGameState({ id, players });

			break;

		case GameEventEnum.SEND_MESSAGE:
			const { chatMessage } = parsedMessage;

			if (!isChatMessage(chatMessage)) {
				return updatePlayer({
					socket,
					event: GameEventEnum.SEND_MESSAGE_FAILED,
					message: "Message failed to send (invalid format)"
				});
			}

			updatePlayersOnChatMessage({ players, chatMessage });

			break;
	}
}
