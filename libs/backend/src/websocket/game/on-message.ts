import { parseRawDataMessage } from "@/utils/functions/parse-raw-data-message.js";
import { WebSocket } from "@fastify/websocket";
import { GameEventEnum } from "types";
import { RawData } from "ws";
import { updatePlayersOnGameState } from "./update-players-on-game-state.js";

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
	}
}
