export const webSocketUrls = {
	ROOT: "/ws",
	WAITING_ROOM: "/ws",
	GAME: "/ws/game/:id"
} as const;

export type WebSocketUrl = (typeof webSocketUrls)[keyof typeof webSocketUrls];
