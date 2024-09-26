import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerFormSchema } from "@/features/authentication/register/config/register-form-schema";
import type { PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { buildBackendUrl } from "@/config/backend";
import { backendUrls, frontendUrls, POST } from "types";
import { setCookie } from "@/features/authentication/utils/set-cookie";

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(registerFormSchema));

	return { form };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const form = await superValidate(request, zod(registerFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const result = await fetch(buildBackendUrl(backendUrls.REGISTER), {
			body: JSON.stringify(form.data),
			headers: {
				"Content-Type": "application/json"
			},
			method: POST
		});

		const data = await result.json();

		if (!result.ok) {
			return fail(400, { form, message: data.message });
		}

		setCookie(result, cookies);

		throw redirect(302, frontendUrls.ROOT);
	}
};
