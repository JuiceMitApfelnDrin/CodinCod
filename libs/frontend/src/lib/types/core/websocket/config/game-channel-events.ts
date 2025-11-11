/**
 * Phoenix Game Channel Events
 *
 * Defines all events used in the game:* Phoenix channel.
 * These events match the Elixir backend GameChannel implementation.
 *
 * Event naming convention: snake_case to match Elixir/Phoenix conventions
 *
 * @see libs/backend/codincod_api/lib/codincod_api_web/channels/game_channel.ex
 */

/**
 * Events sent FROM client TO server
 * These events are handled by the backend's handle_in callbacks
 */
export const GAME_CHANNEL_CLIENT_EVENTS = {
	/** Player updates their code during gameplay */
	CODE_UPDATE: "code_update",

	/** Player submits their solution */
	SUBMISSION_RESULT: "submission_result",

	/** Player signals they are ready to start */
	READY: "ready",

	/** Player sends a chat message */
	CHAT_MESSAGE: "chat_message",

	/** Player requests a hint */
	REQUEST_HINT: "request_hint",

	/** Player is typing (for typing indicators) */
	TYPING: "typing"
} as const;

/**
 * Events sent FROM server TO client
 * These events are broadcast by the backend
 */
export const GAME_CHANNEL_SERVER_EVENTS = {
	/** Another player came online */
	PLAYER_ONLINE: "player_online",

	/** Another player updated their code */
	PLAYER_CODE_UPDATED: "player_code_updated",

	/** Another player submitted their solution */
	PLAYER_SUBMITTED: "player_submitted",

	/** Another player is ready */
	PLAYER_READY: "player_ready",

	/** Chat message from another player */
	CHAT_MESSAGE: "chat_message",

	/** Hint was requested by a player */
	HINT_REQUESTED: "hint_requested",

	/** Another player is typing */
	PLAYER_TYPING: "player_typing",

	/** Game state has been updated */
	GAME_STATE_UPDATED: "game_state_updated",

	/** Game has been completed */
	GAME_COMPLETED: "game_completed",

	/** Presence state information (full state on join) */
	PRESENCE_STATE: "presence_state",

	/** Presence diff (incremental updates when players join/leave) */
	PRESENCE_DIFF: "presence_diff"
} as const;

/**
 * All game channel events (union of client and server events)
 */
export const GAME_CHANNEL_EVENTS = {
	...GAME_CHANNEL_CLIENT_EVENTS,
	...GAME_CHANNEL_SERVER_EVENTS
} as const;

/**
 * Type for client events
 */
export type GameChannelClientEvent =
	(typeof GAME_CHANNEL_CLIENT_EVENTS)[keyof typeof GAME_CHANNEL_CLIENT_EVENTS];

/**
 * Type for server events
 */
export type GameChannelServerEvent =
	(typeof GAME_CHANNEL_SERVER_EVENTS)[keyof typeof GAME_CHANNEL_SERVER_EVENTS];

/**
 * Type for any game channel event
 */
export type GameChannelEvent = GameChannelClientEvent | GameChannelServerEvent;
