export function buildWebSocketUrl(path: string): string {
	const wsBaseUrl = import.meta.env.VITE_BACKEND_WEBSOCKET_MULTIPLAYER;

	if (!wsBaseUrl) {
		throw new Error(
			"VITE_BACKEND_WEBSOCKET_MULTIPLAYER is not defined in .env"
		);
	}

	const baseUrl = wsBaseUrl.endsWith("/") ? wsBaseUrl.slice(0, -1) : wsBaseUrl;
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	return `${baseUrl}${normalizedPath}`;
}
