/**
 * Game configuration constants
 * Shared between frontend and E2E tests for consistent expectations
 */

export const DEFAULT_GAME_LENGTH_IN_MINUTES = 15;
export const DEFAULT_GAME_LENGTH_IN_SECONDS =
	DEFAULT_GAME_LENGTH_IN_MINUTES * 60;
export const DEFAULT_GAME_LENGTH_IN_MILLISECONDS =
	DEFAULT_GAME_LENGTH_IN_SECONDS * 1000;

export const MINIMUM_PLAYERS_IN_GAME = 1;

export const SUBMISSION_BUFFER_IN_SECONDS = 10;
export const SUBMISSION_BUFFER_IN_MILLISECONDS =
	SUBMISSION_BUFFER_IN_SECONDS * 1000;

export const DEFAULT_LANGUAGE = "python";

/**
 * Waiting room countdown duration (in seconds)
 */
export const GAME_START_COUNTDOWN_SECONDS = 5;

/**
 * Maximum time to wait for game start (includes countdown + navigation)
 */
export const GAME_START_TIMEOUT_MS = 20000;

/**
 * WebSocket connection timeout
 */
export const WEBSOCKET_CONNECTION_TIMEOUT_MS = 10000;

/**
 * WebSocket reconnection attempts
 */
export const WEBSOCKET_MAX_RECONNECT_ATTEMPTS = 5;
