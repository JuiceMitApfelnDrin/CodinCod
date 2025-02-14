import { GameRequest, isGameRequest, isWaitingRoomRequest, WaitingRoomRequest } from "types";
import { RawData } from "ws";

function convertRawDataToString(message: RawData): string {
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

export function parseRawDataWaitingRoomRequest(message: RawData): WaitingRoomRequest {
	const messageString = convertRawDataToString(message);

	const receivedMessageData = JSON.parse(messageString);

	if (!isWaitingRoomRequest(receivedMessageData)) {
		throw new Error("parsing message failed");
	}

	return receivedMessageData;
}

export function parseRawDataGameRequest(message: RawData): GameRequest {
	const messageString = convertRawDataToString(message);

	const receivedMessageData = JSON.parse(messageString);

	if (!isGameRequest(receivedMessageData)) {
		throw new Error("parsing message failed");
	}

	return receivedMessageData;
}
