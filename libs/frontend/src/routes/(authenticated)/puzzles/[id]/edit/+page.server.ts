import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { buildBackendUrl } from "@/config/backend";
import { backendUrls, deletePuzzleSchema, PUT, puzzleDtoSchema, type PuzzleDto } from "types";
import { message } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie.js";
import type { PageServerLoadEvent, RequestEvent } from "./$types.js";
import { handleDeletePuzzleForm } from "@/api/handle-delete-puzzle-form.js";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;

	const url = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });
	const response = await fetch(url);

	if (!response.ok) {
		fail(response.status, { error: "Failed to fetch the puzzle." });
	}

	const puzzle: PuzzleDto = await response.json();

	const validate = await superValidate(puzzle, zod(puzzleDtoSchema));
	const validateDeletePuzzle = await superValidate({ id }, zod(deletePuzzleSchema));

	return {
		deletePuzzle: validateDeletePuzzle,
		form: validate
	};
}

export const actions = {
	deletePuzzle: handleDeletePuzzleForm,
	editPuzzle: async ({ params, request }: RequestEvent) => {
		const form = await superValidate(request, zod(puzzleDtoSchema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			fail(400, { form });
		}

		const id = params.id;
		const cookie = request.headers.get("cookie") || "";

		// Prepare the payload
		const body = form.data;

		// Update puzzle data to backend
		const updateUrl = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });
		const response = await fetchWithAuthenticationCookie(updateUrl, {
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				Cookie: cookie
			},
			method: PUT
		});

		if (!response.ok) {
			fail(response.status, { error: "Failed to update the puzzle.", form });
		}

		// Display a success status message
		return message(form, "Form updated successfully!");
	}
};
