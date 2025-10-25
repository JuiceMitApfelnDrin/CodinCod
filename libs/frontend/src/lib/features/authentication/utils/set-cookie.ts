import type { Cookies } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { environment, frontendUrls } from "types";

export function setCookie(result: Response, cookies: Cookies) {
	const setCookieHeader = result.headers.get("set-cookie");

	const isProduction = env.NODE_ENV === environment.PRODUCTION;

	if (setCookieHeader) {
		// Parse the set-cookie header and set cookies
		const cookieParts = setCookieHeader.split("; ");
		const [cookieNameValue] = cookieParts;
		const [name, value] = cookieNameValue.split("=");

		const cookieOptions: any = {
			httpOnly: true,
			path: frontendUrls.ROOT,
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction
		};

		// Only set domain in production, omit for localhost development
		if (isProduction && env.FRONTEND_HOST) {
			cookieOptions.domain = env.FRONTEND_HOST;
		}

		// Set the cookie using SvelteKit's cookies API
		cookies.set(name, value, cookieOptions);
	}
}
