import type { Cookies } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';

export function setCookie(result: Response, cookies: Cookies) {
	const setCookieHeader = result.headers.get("set-cookie");

	if (setCookieHeader) {
		// Parse the set-cookie header and set cookies
		const cookieParts = setCookieHeader.split("; ");
		const [cookieNameValue] = cookieParts;
		const [name, value] = cookieNameValue.split("=");

		// Set the cookie using SvelteKit's cookies API
		cookies.set(name, value, {
			domain: env.NODE_ENV === "production" ? ".codincod.com" : "localhost",
			httpOnly: true,
			path: "/",
			sameSite: env.NODE_ENV === "production" ? "none" : "lax",
			secure: env.NODE_ENV === "production"
		});
	}
}
