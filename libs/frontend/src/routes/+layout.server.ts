import { logger } from "$lib/utils/debug-logger";
import { getAuthenticatedUserInfo } from "@/features/authentication/utils/get-authenticated-user-info.js";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ cookies, fetch }: ServerLoadEvent) {
	// Server-side logs go to terminal, not browser console
	console.log("[SERVER] +layout.server.ts load called");
	logger.page("+layout.server.ts load called");

	const currentUser = await getAuthenticatedUserInfo(cookies, fetch);

	console.log("[SERVER] +layout.server.ts user info:", {
		isAuthenticated: currentUser.isAuthenticated,
		userId: currentUser.userId,
		username: currentUser.username,
		role: currentUser.role
	});
	logger.page("+layout.server.ts returning user data", {
		isAuthenticated: currentUser.isAuthenticated,
		userId: currentUser.userId,
		username: currentUser.username,
		role: currentUser.role
	});

	return currentUser;
}
