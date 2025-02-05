export const rooms = `rooms`;

export function roomById(id: string) {
	return `room:${id}`;
}

export function roomByIdPlayers(id: string) {
	return `room:${id}:players`;
}
