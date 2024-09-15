import { searchParamKeys } from "@/config/search-params.js";
import { getAuthenticatedUserInfo } from "@/utils/get-authenticated-user-info.js";
import { isProtectedRoute } from "@/utils/is-protected-route.js";
import { logout } from "@/utils/logout.js";
import { redirect } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";

export const load = async (event) => {
	const isLoggingOut = event.url.search.includes(searchParamKeys.LOGOUT);

	if (isLoggingOut) {
		logout(event);
	}

	const token = event.cookies.get(cookieKeys.TOKEN);
	const currentUser = getAuthenticatedUserInfo(token);

	const isLoggedOut = !currentUser.isAuthenticated;

	if (isLoggedOut && isProtectedRoute(event)) {
		throw redirect(303, frontendUrls.LOGIN);
	}

	return currentUser;
};
