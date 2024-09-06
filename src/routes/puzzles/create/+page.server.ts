import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";
import { backendUrls, frontendUrls, POST, puzzleEntitySchema } from "types";
import { buildBackendUrl } from "@/config/backend";
import { fail, redirect } from "@sveltejs/kit";
import { buildLocalUrl } from "@/config/routes";
import { fetchWithAuthenticationCookie } from "@/utils/fetch-with-authentication-cookie";

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(puzzleEntitySchema.pick({ title: true })));

	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(puzzleEntitySchema));

		if (!form.valid) {
			fail(400, { form });
		}

		const cookie = request.headers.get("cookie") || "";

		const result = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.PUZZLE), {
			credentials: "include",
			method: POST,
			headers: {
				Cookie: cookie,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(form.data)
		});

		const data = await result.json();

		if (!result.ok) {
			fail(400, { form, message: data.message });
		}

		const editPuzzleUrl = buildLocalUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: data._id });
		throw redirect(302, editPuzzleUrl);
	}
};
