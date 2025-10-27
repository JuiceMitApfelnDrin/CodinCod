import { defaultFetchOptions } from "@/config/default-fetch-options";
import { environment } from "types";

export function getCookieHeader(request: Request): Record<string, string> {
	const cookie = request.headers.get("cookie");
	return cookie ? { cookie } : {};
}

export async function fetchWithAuthenticationCookie(
	url: string | URL | globalThis.Request,
	options: RequestInit = {}
) {
	options.credentials = "include"; // Ensure cookies are included
	options.headers = new Headers({
		...defaultFetchOptions.headers,
		...options.headers
	});

	if (process.env.NODE_ENV === environment.DEVELOPMENT) {
		const headers = options.headers as Headers;
		console.log("[fetchWithAuthenticationCookie]", {
			url: typeof url === "string" ? url : url.toString(),
			hasCookieHeader: headers.has("Cookie"),
			cookieHeader: headers.get("Cookie"),
			allHeaders: Array.from(headers.entries())
		});
	}

	return await fetch(url, {
		...defaultFetchOptions,
		...options
	});
}
