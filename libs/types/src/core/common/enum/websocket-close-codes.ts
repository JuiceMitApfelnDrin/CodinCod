export const websocketCloseCodes = {
	/** Normal closure; the connection successfully completed */
	NORMAL: 1000,

	/** Going away (e.g., server going down or browser navigating away) */
	GOING_AWAY: 1001,

	/** Protocol error */
	PROTOCOL_ERROR: 1002,

	/** Unsupported data type */
	UNSUPPORTED_DATA: 1003,

	/** Reserved - no status received */
	NO_STATUS: 1005,

	/** Reserved - abnormal closure */
	ABNORMAL_CLOSURE: 1006,

	/** Invalid frame payload data */
	INVALID_PAYLOAD: 1007,

	/** Policy violation (e.g., authentication failure) */
	POLICY_VIOLATION: 1008,

	/** Message too big */
	MESSAGE_TOO_BIG: 1009,

	/** Missing extension */
	MISSING_EXTENSION: 1010,

	/** Internal server error */
	INTERNAL_ERROR: 1011,

	/** Service restart */
	SERVICE_RESTART: 1012,

	/** Try again later */
	TRY_AGAIN_LATER: 1013,

	/** Bad gateway */
	BAD_GATEWAY: 1014,

	/** TLS handshake failure */
	TLS_HANDSHAKE: 1015
} as const;