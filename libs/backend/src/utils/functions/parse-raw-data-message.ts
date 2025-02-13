import { isWaitingRoomRequest, WaitingRoomRequest } from "types";
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

export function parseRawDataMessage(message: RawData): WaitingRoomRequest {
	const messageString = convertRawDataToString(message);

	const receivedMessageData = JSON.parse(messageString);

	if (!isWaitingRoomRequest(receivedMessageData)) {
		throw new Error("parsing message failed");
	}

	return receivedMessageData;
}
