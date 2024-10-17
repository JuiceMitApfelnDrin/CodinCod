import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { RequestEvent } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { frontendUrls, loginSchema } from "types";
import { setCookie } from "@/features/authentication/utils/set-cookie";
import { login } from "@/api/login";
import { searchParamKeys } from "@/config/search-params";

export async function load() {
	const form = await superValidate(zod(loginSchema));

	return { form };
}

export const actions = {
	default: async ({ cookies, request, url }: RequestEvent) => {
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

		const redirectUrl = url.searchParams.get(searchParamKeys.REDIRECT_URL);
		const redirectTo = redirectUrl ?? frontendUrls.ROOT;

		throw redirect(302, redirectTo);
	}
};
