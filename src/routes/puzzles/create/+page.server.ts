import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";
import { backendUrls, createPuzzleSchema, frontendUrls, POST, puzzleEntitySchema } from "types";
import { buildBackendUrl } from "@/config/backend";
import { fail, redirect } from "@sveltejs/kit";
import { buildFrontendUrl } from "@/config/frontend";
import { fetchWithAuthenticationCookie } from "@/utils/fetch-with-authentication-cookie";

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createPuzzleSchema));

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(createPuzzleSchema));

		if (!form.valid) {
			fail(400, { form });
		}

		const cookie = request.headers.get("cookie") || "";

		const result = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.PUZZLE), {
			body: JSON.stringify(form.data),
			headers: {
				"Content-Type": "application/json",
				Cookie: cookie
			},
			method: POST
		});

		const data = await result.json();

		if (!result.ok) {
			fail(400, { form, message: data.message });
		}

		const editPuzzleUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: data._id });

		throw redirect(302, editPuzzleUrl);
	}
};
