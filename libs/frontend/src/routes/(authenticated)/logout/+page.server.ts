import {
	backendUrls,
	cookieKeys,
	environment,
	frontendUrls,
	getCookieOptions,
	httpRequestMethod
} from "types";
import type { Actions } from "./$types";
import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";

export const actions = {
	default: async ({ cookies, fetch }) => {
		const token = cookies.get(cookieKeys.TOKEN);

		try {
			const backendUrl = `${env.BACKEND_HOST}${backendUrls.LOGOUT}`;

			// Call the backend logout endpoint to clear the httpOnly cookie
			const response = await fetch(backendUrl, {
				method: httpRequestMethod.POST,
				headers: {
					Cookie: `${cookieKeys.TOKEN}=${token ?? ""}`
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Backend logout failed:", errorText);
			}

			// Also clear it on the frontend side with the same options
			const isProduction = env.NODE_ENV === environment.PRODUCTION;
			const cookieOptions = getCookieOptions({
				isProduction,
				...(env.FRONTEND_HOST && { frontendHost: env.FRONTEND_HOST })
			});

			cookies.delete(cookieKeys.TOKEN, cookieOptions);
		} catch (error) {
			console.error("Error calling logout endpoint:", error);
		}

		// Redirect to home page
		throw redirect(303, frontendUrls.ROOT);
	}
} satisfies Actions;
