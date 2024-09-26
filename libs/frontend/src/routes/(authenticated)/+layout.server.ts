import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { redirect } from "@sveltejs/kit";
import { cookieKeys, frontendUrls } from "types";

export const load = async (event) => {
	const token = event.cookies.get(cookieKeys.TOKEN);
	const currentUser = getAuthenticatedUserInfo(token);

	const isLoggedOut = !currentUser.isAuthenticated;

	if (isLoggedOut) {
		throw redirect(303, frontendUrls.LOGIN);
	}

	return currentUser;
};
