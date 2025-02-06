import { cookieKeys, frontendUrls } from "types";
import type { PageServerLoadEvent } from "./$types";

export const load = async ({ cookies }: PageServerLoadEvent) => {
	cookies.delete(cookieKeys.TOKEN, { path: frontendUrls.ROOT });
	return { loggedOut: true };
};
