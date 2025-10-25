import { cookieKeys, environment, frontendUrls } from "types";
import type { PageServerLoadEvent } from "./$types";
import { env } from "$env/dynamic/private";

export const load = async ({ cookies }: PageServerLoadEvent) => {
	const isProduction = env.NODE_ENV === environment.PRODUCTION;

	cookies.delete(cookieKeys.TOKEN, {
		domain: env.FRONTEND_HOST ?? "localhost",
		path: frontendUrls.ROOT,
		sameSite: isProduction ? "none" : "lax",
		secure: isProduction
	});

	return { loggedOut: true };
};
