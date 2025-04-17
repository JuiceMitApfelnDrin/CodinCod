import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { fail, redirect } from "@sveltejs/kit";
import { buildBackendUrl } from "@/config/backend";
import {
	backendUrls,
	frontendUrls,
	httpResponseCodes,
	httpRequestMethod,
	registerSchema
} from "types";
import { setCookie } from "@/features/authentication/utils/set-cookie";
import type { RequestEvent } from "./$types.js";

export async function load() {
	const form = await superValidate(zod(registerSchema));

	return { form };
}

export const actions = {
	default: async ({ cookies, request }: RequestEvent) => {
		const form = await superValidate(request, zod(registerSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, { form, message: "Form errors" });
		}

		const result = await fetch(buildBackendUrl(backendUrls.REGISTER), {
			body: JSON.stringify(form.data),
			headers: {
				"Content-Type": "application/json"
			},
			method: httpRequestMethod.POST
		});

		const data = await result.json();

		if (!result.ok) {
			const message: string = data.message;

			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, { form, message });
		}

		setCookie(result, cookies);

		throw redirect(httpResponseCodes.REDIRECTION.FOUND, frontendUrls.ROOT);
	}
};
