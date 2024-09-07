import { type BackendUrl } from "types";

interface Params {
	[key: string]: string | number;
}

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
export function buildBackendUrl(path: BackendUrl, params: Params = {}) {
	let url = `${import.meta.env.VITE_BACKEND_URL}${path}`;

	if (params) {
		// Replace placeholders in the path with actual values
		Object.entries(params).forEach(([key, value]) => {
			url = url.replace(`:${key}`, String(value));
		});
	}

	return url;
}
