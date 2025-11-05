import { codincodApiWebAuthControllerRegister2 } from "$lib/api/generated";
import { isSvelteKitRedirect } from "@/features/authentication/utils/is-sveltekit-redirect";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import {
	ERROR_MESSAGES,
	frontendUrls,
	httpResponseCodes,
	registerSchema
} from "types";
import type { RequestEvent } from "./$types.js";

export async function load() {
	const form = await superValidate(zod4(registerSchema));

	return { form };
}

export const actions = {
	default: async ({ cookies, request, fetch }: RequestEvent) => {
		const form = await superValidate(request, zod4(registerSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS
			});
		}

		try {
			// Use the generated API endpoint for registration
			await codincodApiWebAuthControllerRegister2(
				{
					username: form.data.username,
					email: form.data.email,
					password: form.data.password,
					passwordConfirmation: form.data.password
				},
				{ credentials: "include" }
			);

			throw redirect(httpResponseCodes.REDIRECTION.FOUND, frontendUrls.ROOT);
		} catch (error) {
			// Re-throw SvelteKit redirect errors (successful registration)
			if (isSvelteKitRedirect(error)) {
				throw error;
			}

			console.error("Registration error:", error);
			return fail(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
				form,
				message:
					"An unexpected error occurred during registration. Please try again."
			});
		}
	}
};
