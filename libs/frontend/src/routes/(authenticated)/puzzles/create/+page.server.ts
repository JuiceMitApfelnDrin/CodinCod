import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import {
	backendUrls,
	createPuzzleSchema,
	ERROR_MESSAGES,
	frontendUrls,
	httpRequestMethod,
	httpResponseCodes
} from "types";
import { buildBackendUrl } from "@/config/backend";
import { fail, redirect } from "@sveltejs/kit";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import type { RequestEvent } from "./$types.js";

export async function load() {
	const form = await superValidate(zod4(createPuzzleSchema));

	return { form };
}

export const actions = {
	default: async ({ request }: RequestEvent) => {
		const form = await superValidate(request, zod4(createPuzzleSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS
			});
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
				method: httpRequestMethod.POST
			}
		);

		const data = await result.json();

		if (!result.ok) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message: data.message || ERROR_MESSAGES.PUZZLE.FAILED_TO_CREATE
			});
		}

		const editPuzzleUrl = frontendUrls.puzzleByIdEdit(data._id);

		throw redirect(httpResponseCodes.REDIRECTION.FOUND, editPuzzleUrl);
	}
};
