import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { RequestEvent } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import {
	backendUrls,
	ERROR_MESSAGES,
	frontendUrls,
	httpRequestMethod,
	httpResponseCodes,
	loginSchema
} from "types";
import { setCookie } from "@/features/authentication/utils/set-cookie";
import { searchParamKeys } from "@/config/search-params";
import { buildBackendUrl } from "@/config/backend";
import type { LoginRequest } from "types/dist/core/api/schema/auth/login.schema";

export async function load() {
	const form = await superValidate(zod4(loginSchema));

	return { form };
}

export const actions = {
	default: async ({ cookies, request, url }: RequestEvent) => {
		const form = await superValidate(request, zod4(loginSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS
			});
		}

		const payload: LoginRequest = {
			identifier: form.data.identifier,
			password: form.data.password
		};

		const result = await fetch(buildBackendUrl(backendUrls.LOGIN), {
			method: httpRequestMethod.POST,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		const data = await result.json();

		if (!result.ok) {
			const message: string = data.message;

			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message
			});
		}

		setCookie(result, cookies);

		const redirectUrl = url.searchParams.get(searchParamKeys.REDIRECT_URL);
		const redirectTo = redirectUrl ?? frontendUrls.ROOT;

		throw redirect(httpResponseCodes.REDIRECTION.FOUND, redirectTo);
	}
};
