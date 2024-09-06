import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerFormSchema } from "@/features/register/config/register-form-schema";
import type { PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { buildBackendUrl } from "@/config/backend";
import { frontendUrls, POST } from "types";

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(registerFormSchema));

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(registerFormSchema));

		if (!form.valid) {
			fail(400, { form });
		}

		const result = await fetch(buildBackendUrl("register"), {
			method: POST,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(form.data)
		});

		const data = await result.json();

		if (!result.ok) {
			fail(400, { form, message: data.message });
		}

		throw redirect(302, frontendUrls.SIGN_IN);
	}
};
