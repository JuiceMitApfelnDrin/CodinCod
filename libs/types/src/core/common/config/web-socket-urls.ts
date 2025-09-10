export const webSocketUrls = {
	ROOT: "/ws",
	WAITING_ROOM: "/ws",
	gameById: (id: string) => `/ws/game/${id}`,
} as const;

export const webSocketParams = {
	ID: ":id",
};

export type WebSocketUrl = (typeof webSocketUrls)[keyof typeof webSocketUrls];
