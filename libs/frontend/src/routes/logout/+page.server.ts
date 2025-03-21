import { cookieKeys, frontendUrls } from "types";
import type { PageServerLoadEvent } from "./$types";
import { env } from "$env/dynamic/private";

export const load = async ({ cookies }: PageServerLoadEvent) => {
	const isProduction = env.NODE_ENV === "production";

	cookies.delete(cookieKeys.TOKEN, {
		domain: isProduction ? ".codincod.com" : "localhost",
		path: frontendUrls.ROOT,
		sameSite: isProduction ? "none" : "lax",
		secure: isProduction
	});

	return { loggedOut: true };
};
