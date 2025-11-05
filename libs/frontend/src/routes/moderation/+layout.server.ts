import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import { redirect } from "@sveltejs/kit";
import { frontendUrls, isModerator } from "$lib/types";
import type { LayoutServerLoadEvent } from "./$types";

export async function load({ cookies, fetch }: LayoutServerLoadEvent) {
	const currentUser = await getAuthenticatedUserInfo(cookies, fetch);

	if (!currentUser.isAuthenticated) {
		throw redirect(303, frontendUrls.LOGIN);
	}

	if (!isModerator(currentUser.role)) {
		// Redirect non-moderators to home page
		throw redirect(303, frontendUrls.ROOT);
	}

	return currentUser;
}
