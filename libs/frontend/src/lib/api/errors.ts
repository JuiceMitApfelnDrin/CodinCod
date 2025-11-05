/**
 * API Error Types
 *
 * Custom error classes for handling API errors from the Elixir backend.
 * These errors are thrown by the Orval-generated API client.
 */

/**
 * Error response structure from the Elixir backend
 * Can have either array format or object/map format for errors
 */
export interface ElixirApiError {
	message?: string;
	error?: string;
	// Array format: [{ field: "username", message: "error" }]
	errors?:
		| Array<{
				field?: string;
				message: string;
				index?: number;
		  }>
		| Record<string, string | string[]>; // Object/map format: { username: ["error1"], email: "error2" }
	status?: number;
}

/**
 * Custom error class for API errors
 *
 * Wraps HTTP errors from the API with structured error data.
 * This allows for consistent error handling across the application.
 *
 * @example
 * ```ts
 * try {
 *   await api.createPuzzle(data);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error('API error:', error.status, error.data.message);
 *     if (error.isStatus(400)) {
 *       const fieldErrors = error.getFieldErrors();
 *       console.error('Validation errors:', fieldErrors);
 *     }
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
	constructor(
		public status: number,
		public data: ElixirApiError,
		public response?: Response
	) {
		super(data.message || data.error || `API error: ${status}`);
		this.name = "ApiError";
	}

	/**
	 * Check if this is a specific HTTP error status
	 */
	isStatus(status: number): boolean {
		return this.status === status;
	}

	/**
	 * Check if this is a network/connection error
	 */
	isNetworkError(): boolean {
		return this.status === 0 || this.status >= 500;
	}

	/**
	 * Check if this is a client error (4xx)
	 */
	isClientError(): boolean {
		return this.status >= 400 && this.status < 500;
	}

	/**
	 * Get field-specific errors
	 * Handles both array format and object/map format from Elixir backend
	 */
	getFieldErrors(): Record<string, string[]> {
		if (!this.data.errors) return {};

		// Handle object/map format: { username: ["error1", "error2"], email: ["error3"] }
		if (
			typeof this.data.errors === "object" &&
			!Array.isArray(this.data.errors)
		) {
			const fieldErrors: Record<string, string[]> = {};
			for (const [field, messages] of Object.entries(this.data.errors)) {
				if (Array.isArray(messages)) {
					fieldErrors[field] = messages;
				} else if (typeof messages === "string") {
					fieldErrors[field] = [messages];
				}
			}
			return fieldErrors;
		}

		// Handle array format: [{ field: "username", message: "error" }]
		if (Array.isArray(this.data.errors)) {
			const fieldErrors: Record<string, string[]> = {};
			for (const error of this.data.errors) {
				if (error.field) {
					if (!fieldErrors[error.field]) {
						fieldErrors[error.field] = [];
					}
					fieldErrors[error.field].push(error.message);
				}
			}
			return fieldErrors;
		}

		return {};
	}
}
