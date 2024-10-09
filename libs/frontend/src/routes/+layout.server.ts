import { searchParamKeys } from "@/config/search-params.js";
import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { logout } from "@/features/authentication/utils/logout.js";
import { cookieKeys } from "types";

export const load = async ({cookies, url}) => {
	const isLoggingOut = url.search.includes(searchParamKeys.LOGOUT);

	if (isLoggingOut) {
		logout(cookies);
	}

	const token = cookies.get(cookieKeys.TOKEN);
	const currentUser = getAuthenticatedUserInfo(token);

	return currentUser;
};
