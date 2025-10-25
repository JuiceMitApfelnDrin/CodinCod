/**
 * WebSocket Manager
 * 
 * Provides reliable WebSocket connection management with:
 * - Automatic reconnection with exponential backoff
 * - Connection state tracking
 * - Message queuing for offline messages
 * - Type-safe message handling
 */

import {
	WEBSOCKET_STATES,
	WEBSOCKET_RECONNECT,
	WEBSOCKET_CLOSE_CODES,
	type WebSocketState
} from './websocket-constants';

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
		
		this.MAX_RECONNECT_DELAY = options.maxReconnectDelay ?? WEBSOCKET_RECONNECT.MAX_DELAY;
		this.INITIAL_RECONNECT_DELAY = options.initialReconnectDelay ?? WEBSOCKET_RECONNECT.INITIAL_DELAY;
		this.MAX_RECONNECT_ATTEMPTS = options.maxReconnectAttempts ?? WEBSOCKET_RECONNECT.MAX_ATTEMPTS;
		this.reconnectDelay = this.INITIAL_RECONNECT_DELAY;
		
		// Set up network status monitoring
		this.setupNetworkMonitoring();
	}

	/**
	 * Set up listeners for online/offline events
	 */
	private setupNetworkMonitoring(): void {
		if (globalThis.window === undefined) return;

		this.isOnline = navigator.onLine;

		globalThis.window.addEventListener('online', this.handleOnline.bind(this));
		globalThis.window.addEventListener('offline', this.handleOffline.bind(this));
	}

	/**
	 * Manually trigger a reconnection
	 * Useful for user-initiated reconnect button
	 */
	reconnect(): void {
		console.info('Manual reconnect triggered');
		
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
		console.info('Network connection restored');
		this.isOnline = true;
		
		// Automatically attempt to reconnect when network comes back
		if (!this.isConnected() && this.shouldReconnect) {
			console.info('Auto-reconnecting after network restoration');
			this.reconnect();
		}
	}

	private handleOffline(): void {
		console.info('Network connection lost');
		this.isOnline = false;
		
		// Clear any pending reconnect timers when offline
		this.clearReconnectTimer();
	}

	/**
	 * Connect to the WebSocket server
	 */
	connect(): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			console.warn('WebSocket already connected');
			return;
		}

		this.shouldReconnect = true;
		this.setState(WEBSOCKET_STATES.CONNECTING);

		try {
			this.socket = new WebSocket(this.url);
			this.attachEventListeners();
		} catch (error) {
			console.error('Failed to create WebSocket connection:', error);
			this.setState(WEBSOCKET_STATES.ERROR);
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from the WebSocket server
	 */
	disconnect(): void {
		this.shouldReconnect = false;
		this.clearReconnectTimer();
		
		if (this.socket) {
			this.socket.close(WEBSOCKET_CLOSE_CODES.NORMAL, 'Client disconnecting');
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
				this.socket.send(JSON.stringify(data));
			} catch (error) {
				console.error('Failed to send message:', error);
				this.messageQueue.push(data);
			}
		} else {
			console.warn('WebSocket not connected, queuing message');
			this.messageQueue.push(data);
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
		return this.state === WEBSOCKET_STATES.CONNECTED && this.socket?.readyState === WebSocket.OPEN;
	}

	/**
	 * Check if device is online
	 */
	isNetworkOnline(): boolean {
		return this.isOnline;
	}

	private attachEventListeners(): void {
		if (!this.socket) return;

		this.socket.addEventListener('open', this.handleOpen.bind(this));
		this.socket.addEventListener('message', this.handleMessage.bind(this));
		this.socket.addEventListener('close', this.handleClose.bind(this));
		this.socket.addEventListener('error', this.handleError.bind(this));
	}

	private handleOpen(): void {
		console.info('WebSocket connection opened');
		this.setState(WEBSOCKET_STATES.CONNECTED);
		this.reconnectAttempts = 0;
		this.reconnectDelay = this.INITIAL_RECONNECT_DELAY;
		
		// Send any queued messages
		this.flushMessageQueue();
	}

	private handleMessage(event: MessageEvent): void {
		try {
			const data = JSON.parse(event.data);
			
			if (this.validateResponse(data)) {
				this.onMessage(data);
			} else {
				console.error('Received invalid message format:', data);
			}
		} catch (error) {
			console.error('Failed to parse WebSocket message:', error);
		}
	}

	private handleClose(event: CloseEvent): void {
		console.info('WebSocket connection closed:', event.code, event.reason);
		
		// Don't reconnect if it was a clean close initiated by client
		if (event.code === WEBSOCKET_CLOSE_CODES.NORMAL && !this.shouldReconnect) {
			this.setState(WEBSOCKET_STATES.DISCONNECTED);
			return;
		}

		// Handle authentication errors (code 1008)
		if (event.code === WEBSOCKET_CLOSE_CODES.POLICY_VIOLATION) {
			console.error('WebSocket authentication failed:', event.reason);
			this.setState(WEBSOCKET_STATES.ERROR);
			// Don't attempt to reconnect on auth errors - user needs to re-login
			this.shouldReconnect = false;
			
			// Clear any queued messages since they won't be sent
			this.messageQueue = [];
			return;
		}

		// Handle invalid game/room errors (also code 1008 with specific messages)
		if (event.code === WEBSOCKET_CLOSE_CODES.POLICY_VIOLATION && event.reason && 
		    (event.reason.includes('Game not found') || 
		     event.reason.includes('Invalid game ID'))) {
			console.error('WebSocket error:', event.reason);
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
		console.error('WebSocket error:', event);
		this.setState(WEBSOCKET_STATES.ERROR);
	}

	private scheduleReconnect(): void {
		// Don't schedule reconnect if offline
		if (!this.isOnline) {
			console.info('Skipping reconnect - device is offline');
			this.setState(WEBSOCKET_STATES.DISCONNECTED);
			return;
		}

		if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
			console.error('Max reconnect attempts reached');
			this.setState(WEBSOCKET_STATES.ERROR);
			this.shouldReconnect = false;
			return;
		}

		this.setState(WEBSOCKET_STATES.RECONNECTING);
		this.reconnectAttempts++;

		console.info(
			`Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.reconnectDelay}ms`
		);

		this.clearReconnectTimer();
		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, this.reconnectDelay);

		// Exponential backoff with jitter
		this.reconnectDelay = Math.min(
			this.reconnectDelay * 2 + Math.random() * WEBSOCKET_RECONNECT.JITTER_RANGE,
			this.MAX_RECONNECT_DELAY
		);
	}

	private clearReconnectTimer(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	private flushMessageQueue(): void {
		if (this.messageQueue.length === 0) return;

		console.info(`Flushing ${this.messageQueue.length} queued messages`);
		
		while (this.messageQueue.length > 0) {
			const message = this.messageQueue.shift();
			if (message) {
				this.send(message);
			}
		}
	}

	private setState(newState: WebSocketState): void {
		if (this.state !== newState) {
			this.state = newState;
			this.onStateChange?.(newState);
		}
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		this.disconnect();
		this.messageQueue = [];
		
		// Remove network event listeners
		if (globalThis.window !== undefined) {
			globalThis.window.removeEventListener('online', this.handleOnline.bind(this));
			globalThis.window.removeEventListener('offline', this.handleOffline.bind(this));
		}
	}
}
