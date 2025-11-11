import { searchParamKeys } from "@/config/search-params";
import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { redirect } from "@sveltejs/kit";
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

	// Return user info - no need to pass token separately
	// WebSocket connections will use HTTP-only cookies automatically
	return {
		...currentUser
	};
}
