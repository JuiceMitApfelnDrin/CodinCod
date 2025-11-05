import { env } from "$env/dynamic/private";
import { ApiError } from "$lib/api/errors";
import { codincodApiWebAuthControllerLogout } from "$lib/api/generated";
import { redirect } from "@sveltejs/kit";
import { cookieKeys, environment, frontendUrls, getCookieOptions } from "types";
import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, fetch }) => {
		try {
			await codincodApiWebAuthControllerLogout({ credentials: "include" });
		} catch (error) {
			if (error instanceof ApiError) {
				console.error("Backend logout failed:", error.data);
			} else {
				console.error("Error calling logout endpoint:", error);
			}
		}

		const isProduction = env.NODE_ENV === environment.PRODUCTION;
		const cookieOptions = getCookieOptions({
			isProduction,
			...(env.FRONTEND_HOST && { frontendHost: env.FRONTEND_HOST })
		});

		cookies.delete(cookieKeys.TOKEN, cookieOptions);

		throw redirect(303, frontendUrls.ROOT);
	}
} satisfies Actions;
