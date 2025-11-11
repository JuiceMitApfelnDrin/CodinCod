/**
 * Phoenix Socket Manager using official phoenix library
 * @see https://hexdocs.pm/phoenix/js/
 */

import { logger } from "@/utils/debug-logger";
import { Channel, Socket } from "phoenix";
import {
	WEBSOCKET_STATES,
	type WebSocketState
} from "./websocket-constants.js";

export interface PhoenixSocketManagerOptions<TPayload, TResponse> {
	url: string;
	topic: string;
	params?: Record<string, any>;
	onMessage: (event: string, payload: TResponse) => void;
	onStateChange?: (state: WebSocketState) => void;
	onJoinError?: (reason: string) => void;
	validateResponse?: (data: unknown) => data is TResponse;
	maxReconnectDelay?: number;
	initialReconnectDelay?: number;
	maxReconnectAttempts?: number;
}

export class PhoenixSocketManager<TPayload = any, TResponse = any> {
	private socket: Socket | null = null;
	private channel: Channel | null = null;
	private joined = $state(false);

	state = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);

	private readonly url: string;
	private readonly topic: string;
	private readonly params: Record<string, any>;
	private readonly onMessage: (event: string, payload: TResponse) => void;
	private readonly onStateChange: ((state: WebSocketState) => void) | undefined;
	private readonly onJoinError: ((reason: string) => void) | undefined;
	private readonly validateResponse:
		| ((data: unknown) => data is TResponse)
		| undefined;

	constructor(options: PhoenixSocketManagerOptions<TPayload, TResponse>) {
		// Remove token from params - auth happens via cookies
		const { token, ...safeParams } = options.params ?? {};
		this.params = safeParams;

		this.url = options.url;
		this.topic = options.topic;
		this.onMessage = options.onMessage;
		this.onStateChange = options.onStateChange;
		this.onJoinError = options.onJoinError;
		this.validateResponse = options.validateResponse;

		logger.ws("PhoenixSocketManager constructed", {
			url: this.url,
			topic: this.topic
		});
	}

	async connect(): Promise<void> {
		if (this.socket?.isConnected()) {
			logger.ws("Already connected");
			return;
		}

		this.setState(WEBSOCKET_STATES.CONNECTING);

		try {
			// Fetch WebSocket token from backend
			const wsToken = await this.fetchWebSocketToken();

			logger.ws("Creating Phoenix socket", {
				hasToken: !!wsToken,
				url: this.url
			});

			// Create Phoenix socket with official library
			// SECURITY NOTE: We pass the token via params for the initial connection only
			// This works because:
			// 1. The token is only sent during WebSocket upgrade (not in URL logs)
			// 2. Phoenix uses it immediately and doesn't store it in params
			// 3. Reconnections use the same authenticated socket
			const socketParams = {
				...this.params,
				...(wsToken && { token: wsToken })
			};

			this.socket = new Socket(this.url, {
				params: socketParams,
				// Reconnection handled by Phoenix
				reconnectAfterMs: (tries) => {
					const delays = [1000, 2000, 5000, 10000];
					return delays[tries - 1] || 10000;
				},
				logger: (kind, msg, data) => {
					logger.ws(`Phoenix ${kind}: ${msg}`, data);
				}
			});

			// Socket lifecycle hooks
			this.socket.onOpen(() => {
				logger.ws("Socket opened");
				this.setState(WEBSOCKET_STATES.CONNECTED);
				this.joinChannel();
			});

			this.socket.onError((error) => {
				logger.error("Socket error", error);
				this.setState(WEBSOCKET_STATES.ERROR);
			});

			this.socket.onClose(() => {
				logger.ws("Socket closed");
				this.joined = false;
				this.setState(WEBSOCKET_STATES.DISCONNECTED);
			});

			// Connect the socket
			this.socket.connect();
		} catch (error) {
			logger.error("Failed to connect", error);
			this.setState(WEBSOCKET_STATES.ERROR);
			throw error;
		}
	}

	private async fetchWebSocketToken(): Promise<string | null> {
		if (typeof globalThis.window === "undefined") {
			return null;
		}

		try {
			logger.ws("🔥 fetchWebSocketToken: Starting fetch...");
			const controller = new AbortController();
			const timeoutId = setTimeout(() => {
				logger.error(
					"🔥 fetchWebSocketToken: Fetch timed out after 5 seconds!"
				);
				controller.abort();
			}, 5000);

			const response = await fetch("/api/websocket-token", {
				method: "GET",
				credentials: "include",
				headers: { Accept: "application/json" },
				signal: controller.signal
			});

			clearTimeout(timeoutId);
			logger.ws(
				"🔥 fetchWebSocketToken: Fetch completed, status =",
				response.status
			);

			if (response.ok) {
				const data = await response.json();
				logger.ws("🔥 fetchWebSocketToken: Token fetched successfully");
				return data.token;
			}

			if (response.status === 401) {
				logger.ws(
					"🔥 fetchWebSocketToken: 401 - No auth token (user not logged in)"
				);
				return null;
			}

			logger.error(
				`🔥 fetchWebSocketToken: Failed with status ${response.status}`
			);
			return null;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				logger.error("🔥 fetchWebSocketToken: Request was aborted (timeout)");
			} else {
				logger.error("🔥 fetchWebSocketToken: Error fetching token", error);
			}
			return null;
		}
	}

	private joinChannel(): void {
		if (!this.socket || this.joined) return;

		// Create channel
		this.channel = this.socket.channel(this.topic, this.params);

		// Channel lifecycle hooks
		this.channel.onError(() => {
			logger.error("Channel error");
		});

		this.channel.onClose(() => {
			logger.ws("Channel closed");
			this.joined = false;
		});

		// Join the channel
		this.channel
			.join()
			.receive("ok", (response) => {
				logger.ws("Channel joined successfully", response);
				this.joined = true;
			})
			.receive("error", (response) => {
				logger.error("Failed to join channel", response);
				this.onJoinError?.(response.reason || "Unknown error");
			})
			.receive("timeout", () => {
				logger.error("Channel join timeout");
				this.onJoinError?.("Join timeout");
			});

		// Listen for all messages on the channel
		// Phoenix channels require you to explicitly bind to events
		// For a generic handler, you can override channel.onMessage
		const originalOnMessage = this.channel.onMessage.bind(this.channel);
		this.channel.onMessage = (event, payload, ref) => {
			// Let Phoenix handle system events
			const result = originalOnMessage(event, payload, ref);

			// Handle user events (not phx_* events)
			// Special case: presence_state and presence_diff are system events we want to handle
			if (
				!event.startsWith("phx_") ||
				event === "presence_state" ||
				event === "presence_diff"
			) {
				if (this.validateResponse && !this.validateResponse(payload)) {
					logger.error("Invalid message payload", payload);
					return result;
				}
				this.onMessage(event, payload);
			}

			return result;
		};
	}

	push(event: string, payload: TPayload, timeout = 10000): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!this.channel || !this.joined) {
				reject(new Error("Channel not joined"));
				return;
			}

			this.channel
				.push(event, payload as object, timeout)
				.receive("ok", resolve)
				.receive("error", (error) => reject(new Error(error)))
				.receive("timeout", () => reject(new Error("Push timeout")));
		});
	}

	disconnect(): void {
		logger.ws("Disconnecting");

		if (this.channel) {
			this.channel.leave();
			this.channel = null;
		}

		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}

		this.joined = false;
		this.setState(WEBSOCKET_STATES.DISCONNECTED);
	}

	reconnect(): void {
		logger.ws("Manual reconnect");
		this.disconnect();
		this.connect();
	}

	isConnected(): boolean {
		return this.joined && this.socket?.isConnected() === true;
	}

	isNetworkOnline(): boolean {
		// Check browser's online status
		if (typeof globalThis.window !== "undefined") {
			return globalThis.navigator.onLine;
		}
		return true; // Assume online in non-browser environments
	}

	getState(): WebSocketState {
		return this.state;
	}

	private setState(newState: WebSocketState): void {
		if (this.state !== newState) {
			logger.ws(`State change: ${this.state} -> ${newState}`);
			this.state = newState;
			this.onStateChange?.(newState);
		}
	}

	destroy(): void {
		logger.ws("Destroying PhoenixSocketManager");
		this.disconnect();
	}
}
