/**
 * Builds a backend url,
 * with the path added to it,
 * and params switched out,
 * e.g.: buildBackendUrl("users/:id", { id: 5 }), results in backendUrl/users/5
 *
 * @param path
 * @param params
 * @returns the desired url
 */
export function buildBackendUrl(url: string) {
	const backendUrl = import.meta.env.VITE_BACKEND_URL;

	if (!backendUrl) {
		throw new Error("Bruh, you forgot to add VITE_BACKEND_URL to your .env");
	}

	return `${backendUrl}${url}`;
}
