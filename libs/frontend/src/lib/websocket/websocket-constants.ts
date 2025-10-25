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

export const WEBSOCKET_CLOSE_CODES = {
	/** Normal closure; the connection successfully completed */
	NORMAL: 1000,

	/** Going away (e.g., server going down or browser navigating away) */
	GOING_AWAY: 1001,

	/** Protocol error */
	PROTOCOL_ERROR: 1002,

	/** Unsupported data type */
	UNSUPPORTED_DATA: 1003,

	/** Reserved - no status received */
	NO_STATUS: 1005,

	/** Reserved - abnormal closure */
	ABNORMAL_CLOSURE: 1006,

	/** Invalid frame payload data */
	INVALID_PAYLOAD: 1007,

	/** Policy violation (e.g., authentication failure) */
	POLICY_VIOLATION: 1008,

	/** Message too big */
	MESSAGE_TOO_BIG: 1009,

	/** Missing extension */
	MISSING_EXTENSION: 1010,

	/** Internal server error */
	INTERNAL_ERROR: 1011,

	/** Service restart */
	SERVICE_RESTART: 1012,

	/** Try again later */
	TRY_AGAIN_LATER: 1013,

	/** Bad gateway */
	BAD_GATEWAY: 1014,

	/** TLS handshake failure */
	TLS_HANDSHAKE: 1015
} as const;

export const WEBSOCKET_CLOSE_MESSAGES: Record<number, string> = {
	[WEBSOCKET_CLOSE_CODES.NORMAL]: "Connection closed normally",
	[WEBSOCKET_CLOSE_CODES.GOING_AWAY]: "Server going away",
	[WEBSOCKET_CLOSE_CODES.PROTOCOL_ERROR]: "Protocol error",
	[WEBSOCKET_CLOSE_CODES.UNSUPPORTED_DATA]: "Unsupported data",
	[WEBSOCKET_CLOSE_CODES.INVALID_PAYLOAD]: "Invalid payload",
	[WEBSOCKET_CLOSE_CODES.POLICY_VIOLATION]: "Authentication failed",
	[WEBSOCKET_CLOSE_CODES.MESSAGE_TOO_BIG]: "Message too large",
	[WEBSOCKET_CLOSE_CODES.INTERNAL_ERROR]: "Server error",
	[WEBSOCKET_CLOSE_CODES.SERVICE_RESTART]: "Service restarting",
	[WEBSOCKET_CLOSE_CODES.TRY_AGAIN_LATER]: "Server busy",
	[WEBSOCKET_CLOSE_CODES.BAD_GATEWAY]: "Bad gateway"
} as const;
