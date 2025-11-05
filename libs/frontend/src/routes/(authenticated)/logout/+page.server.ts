import { env } from "$env/dynamic/private";
import { ApiError } from "$lib/api/errors";
import { codincodApiWebAuthControllerLogout2 } from "$lib/api/generated";
import { redirect } from "@sveltejs/kit";
import { cookieKeys, environment, frontendUrls, getCookieOptions } from "types";
import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, fetch }) => {
		try {
			// Use the generated API endpoint for logout
			await codincodApiWebAuthControllerLogout2({ credentials: "include" });
		} catch (error) {
			// Log API errors but still proceed with local cleanup
			if (error instanceof ApiError) {
				console.error("Backend logout failed:", error.data);
			} else {
				console.error("Error calling logout endpoint:", error);
			}
		}

		// Also clear the cookie on the frontend side
		const isProduction = env.NODE_ENV === environment.PRODUCTION;
		const cookieOptions = getCookieOptions({
			isProduction,
			...(env.FRONTEND_HOST && { frontendHost: env.FRONTEND_HOST })
		});

		cookies.delete(cookieKeys.TOKEN, cookieOptions);

		// Redirect to home page
		throw redirect(303, frontendUrls.ROOT);
	}
} satisfies Actions;
