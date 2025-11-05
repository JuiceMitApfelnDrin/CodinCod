import { logger } from "$lib/utils/debug-logger";
import { codincodApiWebAccountControllerShow } from "@/api/generated/account/account";
import type { Cookies } from "@sveltejs/kit";
import { cookieKeys } from "types";

/**
 * Verifies authentication status by checking with the backend
 * @param cookies - SvelteKit cookies object
 * @param eventFetch - SvelteKit's fetch function (for SSR)
 * @returns Authentication info including user data if authenticated
 */
export async function getAuthenticatedUserInfo(
	cookies: Cookies,
	eventFetch = fetch
) {
	logger.auth("🔍 Checking authentication status...");

	try {
		// Check if token cookie exists
		const token = cookies.get(cookieKeys.TOKEN);

		logger.auth("Token cookie check", {
			exists: !!token,
			cookieKey: cookieKeys.TOKEN,
			tokenPreview: token ? `${token.substring(0, 20)}...` : null
		});

		if (!token) {
			logger.auth("❌ No token found - user not authenticated");
			return {
				isAuthenticated: false
			};
		}

		logger.auth("Calling account endpoint to verify token...");
		const authenticatedInfo = await codincodApiWebAccountControllerShow({
			fetch: eventFetch
		} as RequestInit);
		logger.auth("✅ Account endpoint response received", authenticatedInfo);

		// The backend returns { isAuthenticated: true, userId, username, role }
		if (
			authenticatedInfo &&
			typeof authenticatedInfo === "object" &&
			"isAuthenticated" in authenticatedInfo
		) {
			logger.auth("✅ User authenticated successfully", {
				userId: authenticatedInfo.userId,
				username: authenticatedInfo.username,
				role: authenticatedInfo.role,
				isAuthenticated: authenticatedInfo.isAuthenticated
			});
			return authenticatedInfo;
		}

		logger.auth(
			"⚠️ Invalid response format from account endpoint - treating as not authenticated"
		);
		return {
			isAuthenticated: false
		};
	} catch (err) {
		// Handle 401 Unauthorized gracefully (invalid/expired token)
		if (err instanceof Error && err.message.includes("401")) {
			logger.auth("❌ 401 Unauthorized - token invalid or expired");
			return {
				isAuthenticated: false
			};
		}

		// Log other errors for debugging
		if (err instanceof Error) {
			logger.error("Error verifying authentication", {
				message: err.message,
				name: err.name,
				stack: err.stack
			});
		} else {
			logger.error("Error verifying authentication (unknown error)", err);
		}

		return {
			isAuthenticated: false
		};
	}
}
