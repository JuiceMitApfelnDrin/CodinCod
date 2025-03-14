export function sendMessageOfType<T>(socket: WebSocket, data: T): void {
	socket.send(JSON.stringify(data));
}
