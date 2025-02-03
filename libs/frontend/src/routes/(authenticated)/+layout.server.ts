import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { redirect } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";
import type { LayoutServerLoadEvent } from "./$types";
import { searchParamKeys } from "@/config/search-params";

export async function load({ cookies, fetch, url }: LayoutServerLoadEvent) {
	const { pathname } = url;

	const token = cookies.get(cookieKeys.TOKEN);

	if (!token) {
		throw redirect(303, frontendUrls.LOGIN + `?${searchParamKeys.REDIRECT_URL}=${pathname}`);
	}

	const currentUser = await getAuthenticatedUserInfo(token, cookies, fetch);

	const isLoggedOut = !currentUser.isAuthenticated;

	if (isLoggedOut) {
		throw redirect(303, frontendUrls.LOGIN + `?${searchParamKeys.REDIRECT_URL}=${pathname}`);
	}

	return currentUser;
}
