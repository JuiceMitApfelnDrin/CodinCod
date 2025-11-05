/**
 * Generic error handling utilities for API calls
 *
 * Provides consistent error handling patterns across the application
 * with support for form errors, redirects, and user-friendly messages.
 */

import type { ActionFailure } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import { ApiError } from "./errors";

export interface ErrorHandlerOptions {
	/** Redirect to this URL on 401 unauthorized errors */
	redirectOnUnauthorized?: string;
	/** Custom error messages for specific status codes */
	statusMessages?: Record<number, string>;
	/** Whether to return field errors from validation failures */
	includeFieldErrors?: boolean;
	/** Default fallback message */
	defaultMessage?: string;
}

export interface ApiErrorResult {
	status: number;
	message: string;
	errors?: Record<string, string[]> | undefined;
	data?: unknown;
}

/**
 * Handle API errors consistently across the application
 *
 * @example
 * ```ts
 * try {
 *   await api.post('/api/login', credentials);
 * } catch (error) {
 *   return handleApiError(error, {
 *     redirectOnUnauthorized: '/login',
 *     statusMessages: {
 *       401: 'Invalid credentials',
 *       429: 'Too many attempts. Please try again later.'
 *     }
 *   });
 * }
 * ```
 */
export function handleApiError(
	error: unknown,
	options: ErrorHandlerOptions = {}
): ActionFailure<ApiErrorResult> | never {
	const {
		redirectOnUnauthorized,
		statusMessages = {},
		includeFieldErrors = true,
		defaultMessage = "An unexpected error occurred"
	} = options;

	// Handle redirect responses (from throw redirect())
	if (error instanceof Response) {
		throw error;
	}

	// Handle API errors
	if (error instanceof ApiError) {
		// Redirect on unauthorized if configured
		if (error.status === 401 && redirectOnUnauthorized) {
			throw redirect(302, redirectOnUnauthorized);
		}

		// Get custom message for this status code
		const message =
			statusMessages[error.status] || error.data.message || error.message;

		// Extract field errors if requested
		const fieldErrors = includeFieldErrors ? error.getFieldErrors() : undefined;

		return fail(error.status, {
			status: error.status,
			message,
			errors: fieldErrors,
			data: error.data
		});
	}

	// Handle other errors
	console.error("Unexpected error:", error);
	return fail(500, {
		status: 500,
		message: defaultMessage
	});
}

/**
 * Wrap an async operation with standardized error handling
 *
 * @example
 * ```ts
 * export const actions = {
 *   submit: async ({ request, fetch }) => {
 *     return withErrorHandling(async () => {
 *       const api = createServerApi(fetch);
 *       const data = await request.formData();
 *       return await api.post('/api/submit', { code: data.get('code') });
 *     }, {
 *       redirectOnUnauthorized: '/login',
 *       defaultMessage: 'Failed to submit code'
 *     });
 *   }
 * };
 * ```
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	options: ErrorHandlerOptions = {}
): Promise<T | ActionFailure<ApiErrorResult>> {
	try {
		return await operation();
	} catch (error) {
		return handleApiError(error, options);
	}
}

/**
 * Load data with error handling and optional fallback
 * Useful for non-critical data that shouldn't break the page
 *
 * @example
 * ```ts
 * export async function load({ fetch }) {
 *   const api = createServerApi(fetch);
 *
 *   const [puzzles, account] = await Promise.all([
 *     api.get('/api/puzzles'),
 *     loadWithFallback(() => api.get('/api/account'), null)
 *   ]);
 *
 *   return { puzzles, account }; // account is null if unauthenticated
 * }
 * ```
 */
export async function loadWithFallback<T, F = null>(
	operation: () => Promise<T>,
	fallback: F
): Promise<T | F> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof ApiError) {
			console.warn("API call failed, using fallback:", error.message);
			return fallback;
		}
		throw error;
	}
}

/**
 * Check if user is authenticated, redirect if not
 *
 * @example
 * ```ts
 * export async function load({ fetch }) {
 *   const api = createServerApi(fetch);
 *   await requireAuth(() => api.get('/api/account'), '/login');
 *   // ... rest of load function
 * }
 * ```
 */
export async function requireAuth<T>(
	operation: () => Promise<T>,
	loginUrl = "/login"
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			throw redirect(302, loginUrl);
		}
		throw error;
	}
}

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.data.message || error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "An unexpected error occurred";
}

/**
 * Check if an error is a specific HTTP status
 */
export function isHttpError(error: unknown, status: number): boolean {
	return error instanceof ApiError && error.status === status;
}
