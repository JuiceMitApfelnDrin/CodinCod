import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { cookieKeys } from "types";

export async function load({ cookies, fetch }: ServerLoadEvent) {
	const token = cookies.get(cookieKeys.TOKEN);

	if (!token) {
		return { isAuthenticated: false };
	}

	const currentUser = await getAuthenticatedUserInfo(token, cookies, fetch);

	return currentUser;
}
