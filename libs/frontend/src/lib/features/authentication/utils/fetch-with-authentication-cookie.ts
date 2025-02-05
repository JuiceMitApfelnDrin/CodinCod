import { defaultFetchOptions } from "@/config/default-fetch-options";

export async function fetchWithAuthenticationCookie(
	url: string | URL | globalThis.Request,
	options: RequestInit = {}
) {
	options.credentials = "include"; // Ensure cookies are included
	options.headers = new Headers({
		...defaultFetchOptions.headers,
		...options.headers
	});

	return await fetch(url, { ...defaultFetchOptions, ...options });
}
