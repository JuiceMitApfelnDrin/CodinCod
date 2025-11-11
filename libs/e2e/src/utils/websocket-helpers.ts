import type { Page } from "@playwright/test";
import { waitForCondition } from "./interaction-helpers.js";

/**
 * WebSocket connection timeout (10 seconds)
 */
const WEBSOCKET_CONNECTION_TIMEOUT_MS = 10000;

/**
 * Wait for WebSocket connection to be established
 *
 * @param page - Playwright page object
 * @param topic - WebSocket channel topic (e.g., "waiting_room:lobby", "game:123")
 * @param options - Optional configuration
 */
export async function waitForWebSocketConnection(
	page: Page,
	topic: string,
	options: {
		timeout?: number;
		expectConnected?: boolean;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? WEBSOCKET_CONNECTION_TIMEOUT_MS;
	const expectConnected = options.expectConnected ?? true;

	await waitForCondition(
		async () => {
			const isConnected = await page.evaluate(
				({ channelTopic }) => {
					const manager = (window as any).phoenixSocketManager;

					if (!manager) return false;

					const channel = manager.channels?.get(channelTopic);
					return channel?.state === "joined";
				},
				{ channelTopic: topic },
			);

			return expectConnected ? isConnected : !isConnected;
		},
		{
			timeout,
			interval: 500,
			errorMessage: `WebSocket channel "${topic}" failed to ${expectConnected ? "connect" : "disconnect"} within ${timeout}ms`,
		},
	);
}

/**
 * Get current WebSocket connection status
 *
 * @param page - Playwright page object
 * @param topic - Channel topic
 */
export async function getWebSocketStatus(
	page: Page,
	topic: string,
): Promise<{
	isConnected: boolean;
	state: string;
	error?: string;
}> {
	return await page.evaluate(
		({ channelTopic }) => {
			const manager = (window as any).phoenixSocketManager;
			if (!manager) {
				return {
					isConnected: false,
					state: "disconnected",
					error: "Phoenix socket manager not found",
				};
			}

			const channel = manager.channels?.get(channelTopic);
			if (!channel) {
				return {
					isConnected: false,
					state: "not_found",
					error: `Channel "${channelTopic}" not found`,
				};
			}

			return {
				isConnected: channel.state === "joined",
				state: channel.state,
				error: channel.error,
			};
		},
		{ channelTopic: topic },
	);
}
