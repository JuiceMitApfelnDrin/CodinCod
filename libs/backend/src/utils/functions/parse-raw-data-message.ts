import { RawData } from "ws";
import { convertRawDataToString } from "./convert-raw-data-to-string.js";
import { WebSocket } from "@fastify/websocket";

export function parseRawDataMessage(message: RawData, socket: WebSocket) {
	const messageString = convertRawDataToString(message);

	if (messageString) {
		try {
			return JSON.parse(messageString);
		} catch (error) {
			socket.send("Failed to parse message:" + error);
		}
	}
}
