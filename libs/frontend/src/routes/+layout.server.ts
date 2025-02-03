import { searchParamKeys } from "@/config/search-params.js";
import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { logout } from "@/features/authentication/utils/logout.js";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { cookieKeys } from "types";

export async function load({ cookies,fetch, url,  }: ServerLoadEvent) {
	const isLoggingOut = url.search.includes(searchParamKeys.LOGOUT);

	if (isLoggingOut) {
		logout(cookies);
	}

	const token = cookies.get(cookieKeys.TOKEN);

	if (!token) {
		return { isAuthenticated: false };
	}

	const currentUser = await getAuthenticatedUserInfo(token, cookies, fetch);

	return currentUser;
}
