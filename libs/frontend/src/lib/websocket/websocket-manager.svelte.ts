/**
 * WebSocket Manager
 *
 * Provides reliable WebSocket connection management with:
 * - Automatic reconnection with exponential backoff
 * - Connection state tracking
 * - Message queuing for offline messages
 * - Type-safe message handling
 */

import { websocketCloseCodes } from "$lib/types/core/common/enum/websocket-close-codes.js";
import { logger } from "@/utils/debug-logger";
import {
	WEBSOCKET_RECONNECT,
	WEBSOCKET_STATES,
	type WebSocketState
} from "./websocket-constants.js";

export interface WebSocketManagerOptions<TRequest, TResponse> {
	url: string;
	onMessage: (data: TResponse) => void;
	onStateChange?: (state: WebSocketState) => void;
	validateResponse: (data: unknown) => data is TResponse;
	maxReconnectDelay?: number;
	initialReconnectDelay?: number;
	maxReconnectAttempts?: number;
}

export class WebSocketManager<TRequest = any, TResponse = any> {
	private socket: WebSocket | null = $state(null);
	private reconnectAttempts = 0;
	private reconnectDelay: number;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private messageQueue: TRequest[] = [];
	private shouldReconnect = true;
	private isOnline = $state(true);

	state = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);

	private readonly MAX_RECONNECT_DELAY: number;
	private readonly INITIAL_RECONNECT_DELAY: number;
	private readonly MAX_RECONNECT_ATTEMPTS: number;

	private readonly url: string;
	private readonly onMessage: (data: TResponse) => void;
	private readonly onStateChange: ((state: WebSocketState) => void) | undefined;
	private readonly validateResponse: (data: unknown) => data is TResponse;

	constructor(options: WebSocketManagerOptions<TRequest, TResponse>) {
		this.url = options.url;
		this.onMessage = options.onMessage;
		this.onStateChange = options.onStateChange;
		this.validateResponse = options.validateResponse;

		this.MAX_RECONNECT_DELAY =
			options.maxReconnectDelay ?? WEBSOCKET_RECONNECT.MAX_DELAY;
		this.INITIAL_RECONNECT_DELAY =
			options.initialReconnectDelay ?? WEBSOCKET_RECONNECT.INITIAL_DELAY;
		this.MAX_RECONNECT_ATTEMPTS =
			options.maxReconnectAttempts ?? WEBSOCKET_RECONNECT.MAX_ATTEMPTS;
		this.reconnectDelay = this.INITIAL_RECONNECT_DELAY;

		logger.ws("WebSocketManager constructed", {
			url: this.url,
			maxReconnectAttempts: this.MAX_RECONNECT_ATTEMPTS,
			initialDelay: this.INITIAL_RECONNECT_DELAY,
			maxDelay: this.MAX_RECONNECT_DELAY
		});

		// Set up network status monitoring
		this.setupNetworkMonitoring();
	}

	/**
	 * Set up listeners for online/offline events
	 */
	private setupNetworkMonitoring(): void {
		if (globalThis.window === undefined) {
			logger.ws("Network monitoring skipped (not in browser)");
			return;
		}

		this.isOnline = navigator.onLine;
		logger.ws(`Network monitoring initialized (online: ${this.isOnline})`);

		globalThis.window.addEventListener("online", this.handleOnline.bind(this));
		globalThis.window.addEventListener(
			"offline",
			this.handleOffline.bind(this)
		);
	}

	/**
	 * Manually trigger a reconnection
	 * Useful for user-initiated reconnect button
	 */
	reconnect(): void {
		logger.ws("Manual reconnect triggered");

		// Reset reconnect state
		this.reconnectAttempts = 0;
		this.reconnectDelay = this.INITIAL_RECONNECT_DELAY;
		this.shouldReconnect = true;

		// Close existing connection if any
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		this.clearReconnectTimer();

		// Attempt to connect
		this.connect();
	}

	private handleOnline(): void {
		logger.ws("Network connection restored");
		this.isOnline = true;

		// Automatically attempt to reconnect when network comes back
		if (!this.isConnected() && this.shouldReconnect) {
			logger.ws("Auto-reconnecting after network restoration");
			this.reconnect();
		}
	}

	private handleOffline(): void {
		logger.ws("Network connection lost");
		this.isOnline = false;

		// Clear any pending reconnect timers when offline
		this.clearReconnectTimer();
	}

	/**
	 * Connect to the WebSocket server
	 */
	connect(): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			logger.ws("Connection attempt skipped - already connected");
			return;
		}

		this.shouldReconnect = true;
		this.setState(WEBSOCKET_STATES.CONNECTING);

		logger.ws(`Connecting to WebSocket: ${this.url}`);

		try {
			this.socket = new WebSocket(this.url);
			this.attachEventListeners();
			logger.ws("WebSocket instance created, waiting for connection...");
		} catch (error) {
			logger.error("Failed to create WebSocket connection", error);
			this.setState(WEBSOCKET_STATES.ERROR);
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from the WebSocket server
	 */
	disconnect(): void {
		logger.ws("Disconnecting WebSocket");
		this.shouldReconnect = false;
		this.clearReconnectTimer();

		if (this.socket) {
			this.socket.close(websocketCloseCodes.NORMAL, "Client disconnecting");
			this.socket = null;
		}

		this.setState(WEBSOCKET_STATES.DISCONNECTED);
	}

	/**
	 * Send a message through the WebSocket
	 * If not connected, queue the message for later
	 */
	send(data: TRequest): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			try {
				logger.ws("Sending message", data);
				this.socket.send(JSON.stringify(data));
			} catch (error) {
				logger.error("Failed to send message", error);
				this.messageQueue.push(data);
				logger.ws(`Message queued (queue size: ${this.messageQueue.length})`);
			}
		} else {
			logger.ws(
				`WebSocket not connected (state: ${this.socket?.readyState}), queuing message`
			);
			this.messageQueue.push(data);
			logger.ws(`Message queued (queue size: ${this.messageQueue.length})`);
		}
	}

	/**
	 * Get current connection state
	 */
	getState(): WebSocketState {
		return this.state;
	}

	/**
	 * Check if WebSocket is connected
	 */
	isConnected(): boolean {
		return (
			this.state === WEBSOCKET_STATES.CONNECTED &&
			this.socket?.readyState === WebSocket.OPEN
		);
	}

	/**
	 * Check if device is online
	 */
	isNetworkOnline(): boolean {
		return this.isOnline;
	}

	private attachEventListeners(): void {
		if (!this.socket) return;

		this.socket.addEventListener("open", this.handleOpen.bind(this));
		this.socket.addEventListener("message", this.handleMessage.bind(this));
		this.socket.addEventListener("close", this.handleClose.bind(this));
		this.socket.addEventListener("error", this.handleError.bind(this));
	}

	private handleOpen(): void {
		logger.ws("WebSocket connection opened successfully");
		this.setState(WEBSOCKET_STATES.CONNECTED);
		this.reconnectAttempts = 0;
		this.reconnectDelay = this.INITIAL_RECONNECT_DELAY;

		// Send any queued messages
		this.flushMessageQueue();
	}

	private handleMessage(event: MessageEvent): void {
		try {
			const data = JSON.parse(event.data);
			logger.ws("Received message", data);

			if (this.validateResponse(data)) {
				this.onMessage(data);
			} else {
				logger.error("Received invalid message format", data);
			}
		} catch (error) {
			logger.error("Failed to parse WebSocket message", error);
		}
	}

	private handleClose(event: CloseEvent): void {
		logger.ws("WebSocket connection closed", {
			code: event.code,
			reason: event.reason || "(no reason)",
			wasClean: event.wasClean
		});

		// Don't reconnect if it was a clean close initiated by client
		if (event.code === websocketCloseCodes.NORMAL && !this.shouldReconnect) {
			this.setState(WEBSOCKET_STATES.DISCONNECTED);
			return;
		}

		// Handle authentication errors (code 1008)
		if (event.code === websocketCloseCodes.POLICY_VIOLATION) {
			logger.error("WebSocket authentication failed", event.reason);
			this.setState(WEBSOCKET_STATES.ERROR);
			// Don't attempt to reconnect on auth errors - user needs to re-login
			this.shouldReconnect = false;

			// Clear any queued messages since they won't be sent
			this.messageQueue = [];
			return;
		}

		// Handle invalid game/room errors (also code 1008 with specific messages)
		if (
			event.code === websocketCloseCodes.POLICY_VIOLATION &&
			event.reason &&
			(event.reason.includes("Game not found") ||
				event.reason.includes("Invalid game ID"))
		) {
			logger.error("WebSocket error", event.reason);
			this.setState(WEBSOCKET_STATES.ERROR);
			this.shouldReconnect = false;
			this.messageQueue = [];
			return;
		}

		if (this.shouldReconnect) {
			this.scheduleReconnect();
		} else {
			this.setState(WEBSOCKET_STATES.DISCONNECTED);
		}
	}

	private handleError(event: Event): void {
		logger.error("WebSocket error event", event);
		this.setState(WEBSOCKET_STATES.ERROR);
	}

	private scheduleReconnect(): void {
		// Don't schedule reconnect if offline
		if (!this.isOnline) {
			logger.ws("Skipping reconnect - device is offline");
			this.setState(WEBSOCKET_STATES.DISCONNECTED);
			return;
		}

		if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
			logger.error(
				`Max reconnect attempts reached (${this.MAX_RECONNECT_ATTEMPTS})`
			);
			this.setState(WEBSOCKET_STATES.ERROR);
			this.shouldReconnect = false;
			return;
		}

		this.setState(WEBSOCKET_STATES.RECONNECTING);
		this.reconnectAttempts++;

		logger.ws(
			`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} in ${this.reconnectDelay}ms`
		);

		this.clearReconnectTimer();
		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, this.reconnectDelay);

		// Exponential backoff with jitter
		this.reconnectDelay = Math.min(
			this.reconnectDelay * 2 +
				Math.random() * WEBSOCKET_RECONNECT.JITTER_RANGE,
			this.MAX_RECONNECT_DELAY
		);
	}

	private clearReconnectTimer(): void {
		if (this.reconnectTimer) {
			logger.ws("Clearing reconnect timer");
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	private flushMessageQueue(): void {
		if (this.messageQueue.length === 0) return;

		logger.ws(`Flushing ${this.messageQueue.length} queued messages`);

		while (this.messageQueue.length > 0) {
			const message = this.messageQueue.shift();
			if (message) {
				this.send(message);
			}
		}
	}

	private setState(newState: WebSocketState): void {
		if (this.state !== newState) {
			logger.ws(`State change: ${this.state} -> ${newState}`);
			this.state = newState;
			this.onStateChange?.(newState);
		}
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		logger.ws("Destroying WebSocketManager");
		this.disconnect();
		this.messageQueue = [];

		// Remove network event listeners
		if (globalThis.window !== undefined) {
			globalThis.window.removeEventListener(
				"online",
				this.handleOnline.bind(this)
			);
			globalThis.window.removeEventListener(
				"offline",
				this.handleOffline.bind(this)
			);
		}
	}
}
