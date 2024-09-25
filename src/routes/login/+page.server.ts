import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { frontendUrls, loginSchema } from "types";
import { login } from "@/features/authentication/login/api/login";
import { setCookie } from "@/features/authentication/utils/setCookie";

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			fail(400, { form });
		}

		const result = await login(form.data.identifier, form.data.password);
		const data = await result.json();

		if (!result.ok) {
			fail(400, { form, message: data.message });
		}

		setCookie(result, cookies);

		throw redirect(302, frontendUrls.ROOT);
	}
};
