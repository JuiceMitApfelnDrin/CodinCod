export const webSocketUrls = {
	ROOT: "/",
	WAITING_ROOM: "/",
	GAME: "/game"
} as const;

export type WebSocketUrl = (typeof webSocketUrls)[keyof typeof webSocketUrls];
