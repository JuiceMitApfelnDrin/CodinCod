import { cookieKeys, frontendUrls } from "types";

export const load = async ({ cookies }) => {
	cookies.delete(cookieKeys.TOKEN, { path: frontendUrls.ROOT });
	return { loggedOut: true };
};
