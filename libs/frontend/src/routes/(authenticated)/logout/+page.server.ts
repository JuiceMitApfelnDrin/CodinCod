import { env } from "$env/dynamic/private";
import { ApiError } from "$lib/api/errors";
import { cookieKeys } from "$lib/types/core/common/config/cookie.js";
import { environment } from "$lib/types/core/common/config/environment.js";
import { getCookieOptions } from "$lib/types/utils/functions/get-cookie-options.js";
import { codincodApiWebAuthControllerLogout } from "@/api/generated/auth/auth";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, fetch }) => {
		try {
			await codincodApiWebAuthControllerLogout({
				credentials: "include",
				fetch
			} as RequestInit);
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
