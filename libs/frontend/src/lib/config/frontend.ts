import type { FrontendUrl } from "types";

interface Params {
	[key: string]: string | number;
}

export function buildFrontendUrl(path: FrontendUrl, params: Params = {}) {
	let url = `${path}`;

	if (params) {
		// Replace placeholders in the path with actual values
		Object.entries(params).forEach(([key, value]) => {
			url = url.replace(`:${key}`, String(value));
		});
	}

	return url;
}
