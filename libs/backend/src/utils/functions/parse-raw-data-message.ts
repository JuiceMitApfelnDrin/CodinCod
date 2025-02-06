import { RawData } from "ws";
import { WebSocket } from "@fastify/websocket";

function convertRawDataToString(message: RawData): string | null {
	if (Buffer.isBuffer(message)) {
		return message.toString("utf-8");
	} else if (Array.isArray(message)) {
		return message.map((buf) => buf.toString("utf-8")).join("");
	} else if (message instanceof ArrayBuffer) {
		return Buffer.from(message).toString("utf-8");
	} else {
		throw new Error("unable to convert, unsupported raw message type");
	}
}

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
