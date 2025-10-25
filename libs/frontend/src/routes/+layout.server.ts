import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ cookies, fetch }: ServerLoadEvent) {
	const currentUser = await getAuthenticatedUserInfo(cookies, fetch);
	return currentUser;
}
