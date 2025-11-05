import { codincodApiWebAuthControllerLogin } from "$lib/api/generated";
import { logger } from "$lib/utils/debug-logger";
import { searchParamKeys } from "@/config/search-params";
import { isSvelteKitRedirect } from "@/features/authentication/utils/is-sveltekit-redirect";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import {
	ERROR_MESSAGES,
	frontendUrls,
	httpResponseCodes,
	loginSchema
} from "types";
import type { RequestEvent } from "./$types";

export async function load() {
	logger.page("Login page load");
	const form = await superValidate(zod4(loginSchema));

	return { form };
}

export const actions = {
	default: async ({ cookies, request, url, fetch }: RequestEvent) => {
		console.log("[SERVER] 🔑 Login action started");
		logger.auth("🔑 Login action started");

		const form = await superValidate(request, zod4(loginSchema));

		if (!form.valid) {
			console.log("[SERVER] ❌ Login form validation failed", form.errors);
			logger.auth("❌ Login form validation failed", form.errors);
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS
			});
		}

		console.log("[SERVER] Login attempt for identifier:", form.data.identifier);
		logger.auth("Login attempt", {
			identifier: form.data.identifier,
			hasPassword: !!form.data.password
		});

		try {
			console.log("[SERVER] Calling login endpoint using generated API");
			logger.auth("Calling login endpoint using generated API");

			await codincodApiWebAuthControllerLogin(
				{
					identifier: form.data.identifier,
					password: form.data.password
				},
				{ credentials: "include", fetch } as RequestInit
			);

			console.log("[SERVER] ✅ Login successful");
			logger.auth("✅ Login successful");

			const redirectUrl = url.searchParams.get(searchParamKeys.REDIRECT_URL);
			const redirectTo = redirectUrl ?? frontendUrls.ROOT;

			console.log("[SERVER] ✅ Login successful, redirecting to:", redirectTo);
			logger.auth("✅ Login successful, redirecting to", redirectTo);

			throw redirect(httpResponseCodes.REDIRECTION.FOUND, redirectTo);
		} catch (error) {
			// Re-throw SvelteKit redirect errors (successful login)
			if (isSvelteKitRedirect(error)) {
				console.log("[SERVER] Redirecting after successful login");
				logger.auth("Redirecting after successful login");
				throw error;
			}

			console.error("[SERVER] Login error:", error);
			logger.error("Login error", error);
			return fail(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
				form,
				message: "An unexpected error occurred. Please try again."
			});
		}
	}
};
