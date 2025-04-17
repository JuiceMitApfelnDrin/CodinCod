import { defaultFetchOptions } from "@/config/default-fetch-options";

export function getCookieHeader(request: Request): Record<string, string> {
	const cookie = request.headers.get("cookie");
	return cookie ? { cookie } : {};
}

export async function fetchWithAuthenticationCookie(
	url: string | URL | globalThis.Request,
	// eslint-disable-next-line no-undef
	options: RequestInit = {}
) {
	options.credentials = "include"; // Ensure cookies are included
	options.headers = new Headers({
		...defaultFetchOptions.headers,
		...options.headers
	});

	return await fetch(url, {
		...defaultFetchOptions,
		...options
	});
}
