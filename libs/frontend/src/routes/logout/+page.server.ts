import { backendUrls, cookieKeys, frontendUrls } from "types";
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
				method: "POST",
				headers: {
					Cookie: `${cookieKeys.TOKEN}=${token ?? ""}`
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Backend logout failed:", errorText);
			}

			// Also clear it on the frontend side just to be safe
			cookies.delete(cookieKeys.TOKEN, { path: "/" });
		} catch (error) {
			console.error("Error calling logout endpoint:", error);
		}

		// Redirect to home page
		throw redirect(303, frontendUrls.ROOT);
	}
} satisfies Actions;
