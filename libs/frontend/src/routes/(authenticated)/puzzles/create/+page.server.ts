import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { backendUrls, createPuzzleSchema, frontendUrls, POST } from "types";
import { buildBackendUrl } from "@/config/backend";
import { fail, redirect } from "@sveltejs/kit";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import type { RequestEvent } from "./$types.js";

export async function load() {
	const form = await superValidate(zod(createPuzzleSchema));

	return { form };
}

export const actions = {
	default: async ({ request }: RequestEvent) => {
		const form = await superValidate(request, zod(createPuzzleSchema));

		if (!form.valid) {
			fail(400, { form });
		}

		const cookie = request.headers.get("cookie") || "";

		const result = await fetchWithAuthenticationCookie(
			buildBackendUrl(backendUrls.PUZZLE),
			{
				body: JSON.stringify(form.data),
				headers: {
					"Content-Type": "application/json",
					Cookie: cookie
				},
				method: POST
			}
		);

		const data = await result.json();

		if (!result.ok) {
			fail(400, { form, message: data.message });
		}

		const editPuzzleUrl = frontendUrls.puzzleByIdEdit(data._id);

		throw redirect(302, editPuzzleUrl);
	}
};
