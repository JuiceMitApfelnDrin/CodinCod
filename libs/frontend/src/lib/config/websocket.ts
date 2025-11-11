export function buildWebSocketUrl(path: string): string {
	// In development, use relative path to leverage Vite proxy
	// This ensures WebSocket connections go through the same origin (localhost:5173)
	// which makes cookie authentication work properly
	const isDev = import.meta.env.DEV;

	if (isDev) {
		// Relative path - browser will use current origin (localhost:5173)
		// Vite proxy will forward /socket/* to ws://localhost:4000/socket/*
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		return normalizedPath;
	}

	// In production, use the full WebSocket URL
	// The backend URL without the protocol prefix
	const backendUrl =
		import.meta.env.VITE_ELIXIR_BACKEND_URL || "http://localhost:4000";

	// Convert http(s) to ws(s)
	const wsBaseUrl = backendUrl.replace(/^http/, "ws");

	// Phoenix WebSocket endpoint is at /socket
	const baseUrl = wsBaseUrl.endsWith("/") ? wsBaseUrl.slice(0, -1) : wsBaseUrl;
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	return `${baseUrl}${normalizedPath}`;
}
