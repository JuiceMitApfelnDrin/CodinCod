import { env } from "$env/dynamic/private";
import { environment } from "$lib/types/core/common/config/environment.js";
import { getCookieOptions } from "$lib/types/utils/functions/get-cookie-options.js";
import type { Cookies } from "@sveltejs/kit";

export function setCookie(result: Response, cookies: Cookies) {
	const setCookieHeader = result.headers.get("set-cookie");

	const isProduction = env.NODE_ENV === environment.PRODUCTION;

	if (setCookieHeader) {
		// Parse the set-cookie header and set cookies
		const cookieParts = setCookieHeader.split("; ");
		const [cookieNameValue] = cookieParts;
		const [name, value] = cookieNameValue.split("=");

		const cookieOptions = getCookieOptions({
			isProduction,
			...(env.FRONTEND_HOST && { frontendHost: env.FRONTEND_HOST })
		});

		// Set the cookie using SvelteKit's cookies API
		cookies.set(name, value, cookieOptions);
	}
}
