import { redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";

export function logout(event: ServerLoadEvent) {
	event.cookies.delete(cookieKeys.TOKEN, { path: frontendUrls.ROOT });

	throw redirect(303, frontendUrls.LOGIN);
}
