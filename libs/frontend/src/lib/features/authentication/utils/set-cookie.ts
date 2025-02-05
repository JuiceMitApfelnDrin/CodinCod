import type { Cookies } from "@sveltejs/kit";

export function setCookie(result: Response, cookies: Cookies) {
	const setCookieHeader = result.headers.get("set-cookie");

	if (setCookieHeader) {
		// Parse the set-cookie header and set cookies
		const cookieParts = setCookieHeader.split("; ");
		const [cookieNameValue] = cookieParts;
		const [name, value] = cookieNameValue.split("=");

		// Set the cookie using SvelteKit's cookies API
		cookies.set(name, value, {
			httpOnly: true,
			path: "/",
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production"
		});
	}
}
