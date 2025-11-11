/**
 * Custom Orval client that uses native fetch with cookie-based authentication
 * This matches the signature expected by Orval's fetch client mode
 *
 * Supports server-side rendering by accepting custom fetch functions from SvelteKit
 * Optionally validates responses with Zod schemas for runtime type safety
 */

import { environment } from "@/types/core/common/config/environment";
import type { ZodSchema } from "zod";

// Extend RequestInit to support custom fetch for server-side rendering and Zod validation
type CustomRequestInit = RequestInit & {
	fetch?: typeof fetch;
	zodSchema?: ZodSchema;
	validateResponse?: boolean;
};

export async function customClient<T>(
	url: string,
	options?: CustomRequestInit
): Promise<T> {
	// Use custom fetch if provided in options, otherwise use global fetch
	const fetchFn = options?.fetch || fetch;

	// Remove custom options from fetch options
	const {
		fetch: _,
		zodSchema,
		validateResponse,
		...fetchOptions
	} = options || {};

	// Make the request using fetch
	const response = await fetchFn(url, {
		...fetchOptions,
		credentials: "include" // Important for cookie-based auth
	});

	// Handle errors
	if (!response.ok) {
		const error = await response.json().catch(() => ({
			message: response.statusText
		}));
		throw new Error(error.message || "API request failed");
	}

	// Handle 204 No Content
	if (response.status === 204 || !response.body) {
		return undefined as T;
	}

	const data = await response.json();

	// Validate with Zod schema if provided
	if (zodSchema && validateResponse !== false) {
		try {
			return zodSchema.parse(data) as T;
		} catch (error) {
			console.error("Response validation failed:", error);
			// In development, throw validation errors
			// Check if we're in development mode (works with Vite)
			if (
				typeof process !== "undefined" &&
				process.env?.NODE_ENV === environment.DEVELOPMENT
			) {
				throw error;
			}
			// In production, log and return unvalidated data (fail gracefully)
			return data as T;
		}
	}

	return data;
}
