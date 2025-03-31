import { env } from "$env/dynamic/private";
import { redirect, type Cookies } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";

export function logout(cookies: Cookies) {
	const isProduction = env.NODE_ENV === "production";

	cookies.delete(cookieKeys.TOKEN, {
		domain: env.FRONTEND_HOST ?? "localhost",
		path: frontendUrls.ROOT,
		sameSite: isProduction ? "none" : "lax",
		secure: isProduction
	});

	throw redirect(303, frontendUrls.LOGIN);
}
