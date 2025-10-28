import { websocketCloseCodes } from "types";

export const WEBSOCKET_STATES = {
	CONNECTING: "connecting",
	CONNECTED: "connected",
	DISCONNECTED: "disconnected",
	RECONNECTING: "reconnecting",
	ERROR: "error"
} as const;

export type WebSocketState =
	(typeof WEBSOCKET_STATES)[keyof typeof WEBSOCKET_STATES];

export const WEBSOCKET_RECONNECT = {
	INITIAL_DELAY: 1 * 1000,
	MAX_DELAY: 30 * 1000,
	MAX_ATTEMPTS: Infinity,
	JITTER_RANGE: 1 * 1000
} as const;

export const WEBSOCKET_CLOSE_MESSAGES: Record<number, string> = {
	[websocketCloseCodes.NORMAL]: "Connection closed normally",
	[websocketCloseCodes.GOING_AWAY]: "Server going away",
	[websocketCloseCodes.PROTOCOL_ERROR]: "Protocol error",
	[websocketCloseCodes.UNSUPPORTED_DATA]: "Unsupported data",
	[websocketCloseCodes.INVALID_PAYLOAD]: "Invalid payload",
	[websocketCloseCodes.POLICY_VIOLATION]: "Authentication failed",
	[websocketCloseCodes.MESSAGE_TOO_BIG]: "Message too large",
	[websocketCloseCodes.INTERNAL_ERROR]: "Server error",
	[websocketCloseCodes.SERVICE_RESTART]: "Service restarting",
	[websocketCloseCodes.TRY_AGAIN_LATER]: "Server busy",
	[websocketCloseCodes.BAD_GATEWAY]: "Bad gateway"
} as const;
