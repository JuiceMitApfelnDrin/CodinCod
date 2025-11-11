import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoadEvent } from "./$types";

export async function load({ cookies, fetch }: LayoutServerLoadEvent) {
	const currentUser = await getAuthenticatedUserInfo(cookies, fetch);

	if (currentUser.isAuthenticated) {
		throw redirect(303, frontendUrls.ROOT);
	}

	return currentUser;
}
