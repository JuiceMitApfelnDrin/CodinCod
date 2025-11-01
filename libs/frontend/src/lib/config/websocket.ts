import { ERROR_MESSAGES } from "types";

export function buildWebSocketUrl(path: string): string {
	const wsBaseUrl = import.meta.env.VITE_BACKEND_WEBSOCKET_MULTIPLAYER;

	if (!wsBaseUrl) {
		throw new Error(
			`${ERROR_MESSAGES.SERVER.INTERNAL_ERROR}: VITE_BACKEND_WEBSOCKET_MULTIPLAYER environment variable is not set`
		);
	}

	const baseUrl = wsBaseUrl.endsWith("/") ? wsBaseUrl.slice(0, -1) : wsBaseUrl;
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	return `${baseUrl}${normalizedPath}`;
}
