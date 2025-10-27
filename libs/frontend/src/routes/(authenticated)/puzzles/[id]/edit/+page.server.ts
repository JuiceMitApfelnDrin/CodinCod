import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { buildBackendUrl } from "@/config/backend";
import {
	backendUrls,
	cookieKeys,
	deletePuzzleSchema,
	editPuzzleSchema,
	environment,
	httpResponseCodes,
	PUT,
	type EditPuzzle
} from "types";
import { error, fail } from "@sveltejs/kit";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie.js";
import type { PageServerLoadEvent, RequestEvent } from "./$types.js";
import { handleDeletePuzzleForm } from "../../../../api/handle-delete-puzzle-form.js";

export async function load({ fetch, params, cookies }: PageServerLoadEvent) {
	const id = params.id;
	const url = buildBackendUrl(backendUrls.puzzleByIdSolution(id));
	const cookie = cookies.get(cookieKeys.TOKEN);

	const response = await fetch(url, {
		credentials: "include",
		headers: {
			Cookie: cookie ? `${cookieKeys.TOKEN}=${cookie}` : ""
		}
	});

	if (!response.ok) {
		throw error(response.status, "Failed to fetch the puzzle.");
	}

	const puzzle: EditPuzzle = await response.json();

	const validate = await superValidate(puzzle, zod4(editPuzzleSchema));
	const validateDeletePuzzle = await superValidate(
		{ id },
		zod4(deletePuzzleSchema)
	);

	return {
		deletePuzzle: validateDeletePuzzle,
		form: validate
	};
}

export const actions = {
	deletePuzzle: handleDeletePuzzleForm,
	editPuzzle: async ({ params, request }: RequestEvent) => {
		const form = await superValidate(request, zod4(editPuzzleSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, { form });
		}

		const id = params.id;
		const cookie = request.headers.get("cookie") || "";

		const body = form.data;

		const updateUrl = buildBackendUrl(backendUrls.puzzleById(id));
		const response = await fetchWithAuthenticationCookie(updateUrl, {
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				Cookie: cookie
			},
			method: PUT
		});

		if (!response.ok) {
			return fail(response.status, {
				error: "Failed to update the puzzle.",
				form
			});
		}

		return message(form, "Form updated successfully!");
	}
};
