/**
 * Phoenix WebSocket Configuration
 *
 * Central configuration for Phoenix Channel protocol constants.
 * These values are used by PhoenixSocketManager for WebSocket communication.
 *
 * @see https://hexdocs.pm/phoenix/Phoenix.Socket.html
 */

/**
 * Phoenix protocol version
 * Must match the version supported by the Elixir Phoenix backend
 */
export const PHOENIX_VERSION = "2.0.0";

/**
 * Heartbeat interval in milliseconds
 * Phoenix sends heartbeat messages to keep the connection alive
 * Default: 30 seconds
 */
export const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Channel join timeout in milliseconds
 * Maximum time to wait for a channel join response
 * Default: 10 seconds
 */
export const JOIN_TIMEOUT_MS = 10_000;

/**
 * Leave message delay in milliseconds
 * Small delay before closing socket after sending leave message
 * Allows the server to process the leave message gracefully
 * Default: 100 milliseconds
 */
export const LEAVE_MESSAGE_DELAY_MS = 100;

/**
 * Phoenix system events
 * These are internal Phoenix protocol events
 */
export const PHOENIX_SYSTEM_EVENTS = {
	JOIN: "phx_join",
	LEAVE: "phx_leave",
	REPLY: "phx_reply",
	ERROR: "phx_error",
	CLOSE: "phx_close",
	HEARTBEAT: "heartbeat"
} as const;

export type PhoenixSystemEvent =
	(typeof PHOENIX_SYSTEM_EVENTS)[keyof typeof PHOENIX_SYSTEM_EVENTS];
