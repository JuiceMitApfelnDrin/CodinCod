export const ERROR_MESSAGES = {
	FORM: {
		VALIDATION_ERRORS: "Form validation errors",
		REQUIRED_FIELD: "This field is required",
	},
	FETCH: {
		FAILED_TO_LOAD: "Failed to load data",
		FAILED_TO_FETCH: "Failed to fetch",
		NETWORK_ERROR: "Network error occurred",
	},
	AUTHENTICATION: {
		INVALID_CREDENTIALS: "Invalid email/username or password",
		UNAUTHORIZED: "You are not authorized to perform this action",
		SESSION_EXPIRED: "Your session has expired. Please login again",
		AUTHENTICATION_REQUIRED: "Authentication required",
	},
	MODERATION: {
		FAILED_TO_FETCH_REVIEW_ITEMS: "Failed to fetch review items",
	},
	PUZZLE: {
		FAILED_TO_DELETE: "Failed to delete the puzzle",
		FAILED_TO_UPDATE: "Failed to update the puzzle",
		FAILED_TO_CREATE: "Failed to create the puzzle",
		NOT_FOUND: "Puzzle not found",
	},
	GAME: {
		NOT_FOUND: "Game not found",
		USER_NOT_IN_GAME: "User not in this game",
		ALREADY_FINISHED: "Game has already finished",
		FAILED_TO_START: "Failed to start game",
	},
	SERVER: {
		INTERNAL_ERROR: "Internal server error",
		DATABASE_ERROR: "Database error occurred",
	},
	GENERIC: {
		SOMETHING_WENT_WRONG: "Something went wrong",
		TRY_AGAIN_LATER: "Please try again later",
	},
} as const;
