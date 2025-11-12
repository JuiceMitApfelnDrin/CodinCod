/**
 * Phoenix Socket Manager using official phoenix library
 * 
 * Follows Phoenix Channel best practices:
 * - Uses official phoenix.js Socket and Channel classes
 * - Implements proper presence tracking with Presence module
 * - Handles reconnection automatically via Phoenix
 * - Properly manages channel lifecycle (join, leave, error, close)
 * - Implements heartbeat to keep connection alive
 * 
 * @see https://hexdocs.pm/phoenix/js/
 */

import { logger } from "@/utils/debug-logger";
import { Channel, Presence, Socket } from "phoenix";
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
	onPresenceSync?: (presences: any[]) => void;
	onPresenceJoin?: (id: string, current: any, newPres: any) => void;
	onPresenceLeave?: (id: string, current: any, leftPres: any) => void;
	validateResponse?: (data: unknown) => data is TResponse;
	heartbeatIntervalMs?: number;
	rejoinAfterMs?: (tries: number) => number;
}

export class PhoenixSocketManager<TPayload = any, TResponse = any> {
	private socket: Socket | null = null;
	private channel: Channel | null = null;
	private presence: Presence | null = null;
	private joined = $state(false);
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

	state = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);

	private readonly url: string;
	private readonly topic: string;
	private readonly params: Record<string, any>;
	private readonly onMessage: (event: string, payload: TResponse) => void;
	private readonly onStateChange: ((state: WebSocketState) => void) | undefined;
	private readonly onJoinError: ((reason: string) => void) | undefined;
	private readonly onPresenceSync: ((presences: any[]) => void) | undefined;
	private readonly onPresenceJoin: ((id: string, current: any, newPres: any) => void) | undefined;
	private readonly onPresenceLeave: ((id: string, current: any, leftPres: any) => void) | undefined;
	private readonly validateResponse:
		| ((data: unknown) => data is TResponse)
		| undefined;
	private readonly heartbeatIntervalMs: number;
	private readonly rejoinAfterMs: (tries: number) => number;

	constructor(options: PhoenixSocketManagerOptions<TPayload, TResponse>) {
		// Remove token from params - auth happens via cookies or token param
		const { token, ...safeParams } = options.params ?? {};
		this.params = safeParams;

		this.url = options.url;
		this.topic = options.topic;
		this.onMessage = options.onMessage;
		this.onStateChange = options.onStateChange;
		this.onJoinError = options.onJoinError;
		this.onPresenceSync = options.onPresenceSync;
		this.onPresenceJoin = options.onPresenceJoin;
		this.onPresenceLeave = options.onPresenceLeave;
		this.validateResponse = options.validateResponse;
		
		// Default heartbeat: 30 seconds (Phoenix default)
		this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 30000;
		
		// Default rejoin strategy: exponential backoff
		this.rejoinAfterMs = options.rejoinAfterMs ?? ((tries) => {
			const delays = [1000, 2000, 5000, 10000];
			return delays[tries - 1] || 10000;
		});

		logger.ws("PhoenixSocketManager constructed", {
			url: this.url,
			topic: this.topic,
			heartbeatMs: this.heartbeatIntervalMs
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
			// This is the standard Phoenix approach as documented in hexdocs.pm/phoenix
			const socketParams = {
				...this.params,
				...(wsToken && { token: wsToken })
			};

			this.socket = new Socket(this.url, {
				params: socketParams,
				// Reconnection handled by Phoenix with exponential backoff
				reconnectAfterMs: this.rejoinAfterMs,
				// Heartbeat to detect stale connections
				heartbeatIntervalMs: this.heartbeatIntervalMs,
				// Optional: Custom logger for debugging
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

			this.socket.onClose((event) => {
				logger.ws("Socket closed", {
					code: event?.code,
					reason: event?.reason,
					wasClean: event?.wasClean
				});
				this.joined = false;
				this.setState(WEBSOCKET_STATES.DISCONNECTED);
				this.stopCustomHeartbeat();
			});			// Connect the socket
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

		// Set up presence tracking if callbacks are provided
		if (this.onPresenceSync || this.onPresenceJoin || this.onPresenceLeave) {
			this.setupPresence();
		}

		// Channel lifecycle hooks
		this.channel.onError((error) => {
			logger.error("Channel error", error);
			// Phoenix will automatically attempt to rejoin
		});

		this.channel.onClose(() => {
			logger.ws("Channel closed");
			this.joined = false;
			this.presence = null;
		});

		// Join the channel
		this.channel
			.join()
			.receive("ok", (response) => {
				logger.ws("Channel joined successfully", response);
				this.joined = true;
				// Start custom heartbeat (in addition to Phoenix's built-in heartbeat)
				this.startCustomHeartbeat();
			})
			.receive("error", (response) => {
				logger.error("Failed to join channel", response);
				this.onJoinError?.(response.reason || "Unknown error");
				this.setState(WEBSOCKET_STATES.ERROR);
			})
			.receive("timeout", () => {
				logger.error("Channel join timeout");
				this.onJoinError?.("Join timeout");
				this.setState(WEBSOCKET_STATES.ERROR);
			});

		// Listen for all messages on the channel
		// Phoenix channels require you to explicitly bind to events
		// For a generic handler, we override channel.onMessage
		const originalOnMessage = this.channel.onMessage.bind(this.channel);
		this.channel.onMessage = (event, payload, ref) => {
			// Let Phoenix handle system events first
			const result = originalOnMessage(event, payload, ref);

			// Handle user events (not phx_* events)
			// Special case: presence_state and presence_diff are system events we want to handle
			if (
				!event.startsWith("phx_") ||
				event === "presence_state" ||
				event === "presence_diff"
			) {
				if (this.validateResponse && !this.validateResponse(payload)) {
					logger.error("Invalid message payload", { event, payload });
					return result;
				}
				this.onMessage(event, payload);
			}

			return result;
		};
	}

	/**
	 * Set up Phoenix Presence tracking
	 * @see https://hexdocs.pm/phoenix/presence.html
	 */
	private setupPresence(): void {
		if (!this.channel) return;

		this.presence = new Presence(this.channel);

		// Sync callback - called when presence state changes
		if (this.onPresenceSync) {
			this.presence.onSync(() => {
				const presences = this.presence!.list();
				logger.ws("Presence synced", { count: presences.length });
				this.onPresenceSync!(presences);
			});
		}

		// Join callback - called when a user joins
		if (this.onPresenceJoin) {
			this.presence.onJoin((id, current, newPres) => {
				if (id) {
					logger.ws("Presence join", { id, current, newPres });
					this.onPresenceJoin!(id, current, newPres);
				}
			});
		}

		// Leave callback - called when a user leaves
		if (this.onPresenceLeave) {
			this.presence.onLeave((id, current, leftPres) => {
				if (id) {
					logger.ws("Presence leave", { id, current, leftPres });
					this.onPresenceLeave!(id, current, leftPres);
				}
			});
		}
	}

	/**
	 * Start custom heartbeat to keep channel alive
	 * This is in addition to Phoenix's built-in socket heartbeat
	 */
	private startCustomHeartbeat(): void {
		// Clear any existing heartbeat
		this.stopCustomHeartbeat();

		// Send periodic heartbeat messages to keep channel alive
		this.heartbeatInterval = setInterval(() => {
			if (this.joined && this.channel) {
				this.channel
					.push("heartbeat", {}, 5000)
					.receive("ok", () => {
						// Heartbeat acknowledged
					})
					.receive("error", (err) => {
						logger.error("Heartbeat error", err);
					})
					.receive("timeout", () => {
						logger.ws("Heartbeat timeout - Phoenix will handle reconnection");
						// Phoenix will handle reconnection
					});
			}
		}, this.heartbeatIntervalMs);

		logger.ws(`Custom heartbeat started (${this.heartbeatIntervalMs}ms)`);
	}

	/**
	 * Stop custom heartbeat
	 */
	private stopCustomHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
			logger.ws("Custom heartbeat stopped");
		}
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

		this.stopCustomHeartbeat();

		if (this.channel) {
			this.channel.leave();
			this.channel = null;
		}

		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}

		this.joined = false;
		this.presence = null;
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
		this.stopCustomHeartbeat();
	}

	/**
	 * Get list of presences (if presence tracking is enabled)
	 */
	getPresences(): any[] {
		if (!this.presence) return [];
		return this.presence.list();
	}

	/**
	 * Get presence count
	 */
	getPresenceCount(): number {
		return this.getPresences().length;
	}
}
