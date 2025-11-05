import { searchParamKeys } from "@/config/search-params";
import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { redirect } from "@sveltejs/kit";
import { frontendUrls } from "types";
import type { LayoutServerLoadEvent } from "./$types";

export async function load({ cookies, fetch, url }: LayoutServerLoadEvent) {
	const { pathname } = url;

	const currentUser = await getAuthenticatedUserInfo(cookies, fetch);

	const isLoggedOut = !currentUser.isAuthenticated;

	if (isLoggedOut) {
		throw redirect(
			303,
			frontendUrls.LOGIN + `?${searchParamKeys.REDIRECT_URL}=${pathname}`
		);
	}

	return currentUser;
}
