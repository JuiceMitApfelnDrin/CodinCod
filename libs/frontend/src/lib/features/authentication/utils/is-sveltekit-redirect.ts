/**
 * Type guard to check if an error is a SvelteKit redirect
 *
 * SvelteKit's redirect() function throws an object with status and location properties.
 * This helper detects those redirect errors so they can be re-thrown to allow
 * SvelteKit's routing layer to handle them properly.
 *
 * @param error - The caught error to check
 * @returns true if the error is a SvelteKit redirect (status 3xx with location)
 *
 * @example
 * ```ts
 * try {
 *   await doSomething();
 *   throw redirect(302, '/dashboard');
 * } catch (error) {
 *   if (isSvelteKitRedirect(error)) {
 *     throw error; // Let SvelteKit handle the redirect
 *   }
 *   // Handle other errors
 * }
 * ```
 */
export function isSvelteKitRedirect(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		"location" in error &&
		typeof error.status === "number" &&
		error.status >= 300 &&
		error.status < 400
	);
}
