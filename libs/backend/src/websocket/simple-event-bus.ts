import { getRedis } from "./redis-client.js";
import type { WaitingRoomEvent } from "./types.js";
import { WEBSOCKET_CONSTANTS } from "@/config/constants.js";

// Simple event publishing
export async function publishEvent(event: WaitingRoomEvent): Promise<void> {
	const redis = getRedis();
	await redis.publish(
		WEBSOCKET_CONSTANTS.REDIS.CHANNELS.WAITING_ROOM_EVENTS,
		JSON.stringify(event)
	);
}

// Simple event subscription with handler
export async function subscribeToEvents(
	handler: (event: WaitingRoomEvent) => void
): Promise<void> {
	const redis = getRedis().duplicate();

	await redis.subscribe(WEBSOCKET_CONSTANTS.REDIS.CHANNELS.WAITING_ROOM_EVENTS);

	redis.on("message", (_channel: string, message: string) => {
		try {
			const event = JSON.parse(message) as WaitingRoomEvent;
			handler(event);
		} catch (error) {
			console.error("Failed to parse event:", error);
		}
	});
}
