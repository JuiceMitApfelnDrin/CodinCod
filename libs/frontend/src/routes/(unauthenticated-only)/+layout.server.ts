import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { redirect } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";
import type { LayoutServerLoadEvent } from "./$types";

export async function load({ cookies }: LayoutServerLoadEvent) {
	const token = cookies.get(cookieKeys.TOKEN);
	const currentUser = getAuthenticatedUserInfo(token, cookies);

	if (currentUser.isAuthenticated) {
		throw redirect(303, frontendUrls.ROOT);
	}

	return currentUser;
}
