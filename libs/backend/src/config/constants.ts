export const DEFAULT_DB_NAME = "codincod";

// WebSocket constants
export const WEBSOCKET_CONSTANTS = {
	ROOM: {
		MAX_PLAYERS: 4,
		DEFAULT_MAX_PLAYERS: 4,
		ID_PREFIX: "room-",
		ID_LENGTH: 15
	},
	SOCKET: {
		ID_PREFIX: "socket-",
		ID_LENGTH: 15,
		CLOSE_CODES: {
			UNAUTHORIZED: 1008,
			USER_NOT_FOUND: 1008
		}
	},
	REDIS: {
		KEYS: {
			USER_PREFIX: "user:",
			ROOM_PREFIX: "room:"
		},
		CHANNELS: {
			WAITING_ROOM_EVENTS: "waiting-room-events"
		}
	}
} as const;
