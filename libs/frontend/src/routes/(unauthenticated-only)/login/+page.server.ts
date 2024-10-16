import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad, RequestEvent } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { frontendUrls, loginSchema } from "types";
import { setCookie } from "@/features/authentication/utils/set-cookie";
import { login } from "@/api/login";

export async function load() {
	const form = await superValidate(zod(loginSchema));

	return { form };
}

export const actions = {
	default: async ({ cookies, request }: RequestEvent) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const result = await login(form.data.identifier, form.data.password);
		const data = await result.json();

		if (!result.ok) {
			return fail(400, { form, message: data.message });
		}

		setCookie(result, cookies);

		throw redirect(302, frontendUrls.ROOT);
	}
};
