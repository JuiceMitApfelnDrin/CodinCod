import type { Cookies } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { frontendUrls } from "types";

export function setCookie(result: Response, cookies: Cookies) {
	const setCookieHeader = result.headers.get("set-cookie");

	const isProduction = env.NODE_ENV === "production";

	if (setCookieHeader) {
		// Parse the set-cookie header and set cookies
		const cookieParts = setCookieHeader.split("; ");
		const [cookieNameValue] = cookieParts;
		const [name, value] = cookieNameValue.split("=");

		// Set the cookie using SvelteKit's cookies API
		cookies.set(name, value, {
			domain: env.FRONTEND_HOST ?? "localhost",
			httpOnly: true,
			path: frontendUrls.ROOT,
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction
		});
	}
}
