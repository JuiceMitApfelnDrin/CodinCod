/**
 * User-friendly error notifications for API errors
 *
 * Provides toast notifications for critical errors with appropriate messaging
 * based on error type (network, auth, validation, server error, etc.)
 */

import { toast } from "svelte-sonner";
import { ApiError } from "./errors";

export interface NotificationOptions {
	/** Show notification for this error? Default: true */
	showNotification?: boolean;

	/** Custom title for the notification */
	title?: string;

	/** Custom message override */
	message?: string;

	/** Duration in milliseconds (default: based on severity) */
	duration?: number;

	/** Action button config */
	action?: {
		label: string;
		onClick: () => void;
	};
}

/**
 * Show appropriate error notification based on error type
 *
 * @example
 * ```typescript
 * try {
 *   await api.post('/api/submit', data);
 * } catch (error) {
 *   showErrorNotification(error, {
 *     title: 'Submission Failed',
 *     action: {
 *       label: 'Retry',
 *       onClick: () => submitAgain()
 *     }
 *   });
 *   throw error;
 * }
 * ```
 */
export function showErrorNotification(
	error: unknown,
	options: NotificationOptions = {}
): void {
	const { showNotification = true, title, message, duration, action } = options;

	if (!showNotification) return;

	if (error instanceof ApiError) {
		// Network/Connection errors (status 0 or 5xx)
		if (error.isNetworkError()) {
			const toastOptions: {
				description: string;
				duration: number;
				action?: { label: string; onClick: () => void };
			} = {
				description:
					message ||
					error.data.message ||
					"Unable to reach the server. Please check your internet connection and try again.",
				duration: duration || 6000
			};

			if (action) {
				toastOptions.action = {
					label: action.label,
					onClick: action.onClick
				};
			}

			toast.error(title || "Connection Error", toastOptions);
			return;
		}

		// Authentication errors (401)
		if (error.isStatus(401)) {
			const defaultAction = {
				label: "Log In",
				onClick: () => (window.location.href = "/login")
			};

			toast.error(title || "Authentication Required", {
				description:
					message || error.data.message || "Please log in to continue.",
				duration: duration || 5000,
				action: action || defaultAction
			});
			return;
		}

		// Authorization errors (403)
		if (error.isStatus(403)) {
			toast.error(title || "Access Denied", {
				description:
					message ||
					error.data.message ||
					"You do not have permission to perform this action.",
				duration: duration || 5000
			});
			return;
		}

		// Not found errors (404)
		if (error.isStatus(404)) {
			toast.error(title || "Not Found", {
				description:
					message ||
					error.data.message ||
					"The requested resource could not be found.",
				duration: duration || 4000
			});
			return;
		}

		// Rate limiting (429)
		if (error.isStatus(429)) {
			toast.error(title || "Too Many Requests", {
				description:
					message ||
					error.data.message ||
					"You are making requests too quickly. Please wait a moment and try again.",
				duration: duration || 5000
			});
			return;
		}

		// Validation errors (400)
		if (error.isStatus(400)) {
			const fieldErrors = error.getFieldErrors();
			const hasFieldErrors = Object.keys(fieldErrors).length > 0;

			toast.error(title || "Validation Error", {
				description:
					message ||
					(hasFieldErrors
						? "Please check the form for errors."
						: error.data.message || "The data you provided is invalid."),
				duration: duration || 5000
			});
			return;
		}

		// Server errors (500+)
		if (error.status >= 500) {
			const toastOptions: {
				description: string;
				duration: number;
				action?: { label: string; onClick: () => void };
			} = {
				description:
					message || "An error occurred on the server. Please try again later.",
				duration: duration || 6000
			};

			if (action) {
				toastOptions.action = {
					label: action.label,
					onClick: action.onClick
				};
			}

			toast.error(title || "Server Error", toastOptions);
			return;
		}

		// Generic API error
		const toastOptions: {
			description: string;
			duration: number;
			action?: { label: string; onClick: () => void };
		} = {
			description: message || error.data.message || error.message,
			duration: duration || 4000
		};

		if (action) {
			toastOptions.action = {
				label: action.label,
				onClick: action.onClick
			};
		}

		toast.error(title || "Error", toastOptions);
		return;
	}

	// Non-API errors
	console.error("Unexpected error:", error);
	toast.error(title || "Unexpected Error", {
		description: message || "An unexpected error occurred. Please try again.",
		duration: duration || 4000
	});
}

/**
 * Show success notification
 */
export function showSuccessNotification(
	message: string,
	options: { title?: string; duration?: number } = {}
): void {
	const { title, duration = 3000 } = options;

	if (title) {
		toast.success(title, {
			description: message,
			duration
		});
	} else {
		toast.success(message, { duration });
	}
}

/**
 * Show info notification
 */
export function showInfoNotification(
	message: string,
	options: { title?: string; duration?: number } = {}
): void {
	const { title, duration = 3000 } = options;

	if (title) {
		toast.info(title, {
			description: message,
			duration
		});
	} else {
		toast.info(message, { duration });
	}
}

/**
 * Show warning notification
 */
export function showWarningNotification(
	message: string,
	options: { title?: string; duration?: number } = {}
): void {
	const { title, duration = 4000 } = options;

	if (title) {
		toast.warning(title, {
			description: message,
			duration
		});
	} else {
		toast.warning(message, { duration });
	}
}

/**
 * Wrapper for critical operations that should always notify on error
 *
 * @example
 * ```typescript
 * await withErrorNotification(
 *   () => api.post('/api/submit', data),
 *   { title: 'Submission Failed' }
 * );
 * ```
 */
export async function withErrorNotification<T>(
	operation: () => Promise<T>,
	options: NotificationOptions = {}
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		showErrorNotification(error, options);
		throw error;
	}
}
