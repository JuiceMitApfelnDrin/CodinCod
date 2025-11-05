export const webSocketUrls = {
	// Phoenix WebSocket endpoint - all connections go through /socket
	ROOT: "/socket",
	WAITING_ROOM: "/socket",
	// Phoenix channels use the pattern: channel_name:identifier
	// The actual channel join happens after WebSocket connection
	gameById: (id: string) => `/socket`,
} as const;

export const webSocketParams = {
	ID: ":id",
};

// Phoenix channel names (used after WebSocket connection)
export const phoenixChannels = {
	game: (id: string) => `game:${id}`,
} as const;

export type WebSocketUrl = (typeof webSocketUrls)[keyof typeof webSocketUrls];
