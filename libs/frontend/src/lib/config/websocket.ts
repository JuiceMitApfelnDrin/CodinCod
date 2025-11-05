export function buildWebSocketUrl(path: string): string {
	// Use the Elixir backend WebSocket endpoint
	// In development: ws://localhost:4000/socket
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
