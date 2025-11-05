/**
 * Custom Orval client that uses native fetch with cookie-based authentication
 * This matches the signature expected by Orval's fetch client mode
 *
 * Supports server-side rendering by accepting custom fetch functions from SvelteKit
 */

// Extend RequestInit to support custom fetch for server-side rendering
type CustomRequestInit = RequestInit & {
	fetch?: typeof fetch;
};

export async function customClient<T>(
	url: string,
	options?: CustomRequestInit
): Promise<T> {
	// Use custom fetch if provided in options, otherwise use global fetch
	const fetchFn = options?.fetch || fetch;

	// Remove custom fetch from options to avoid passing it to native fetch
	const { fetch: _, ...fetchOptions } = options || {};

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

	return response.json();
}
