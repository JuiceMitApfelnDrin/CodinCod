import { redirect, type Cookies } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";

export function logout(cookies: Cookies) {
	cookies.delete(cookieKeys.TOKEN, { path: frontendUrls.ROOT });

	throw redirect(303, frontendUrls.LOGIN);
}
