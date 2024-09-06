import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { buildBackendUrl } from "@/config/backend";
import { backendUrls, PUT, puzzleEntitySchema, type PuzzleEntity } from "types";
import { message } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";

export async function load({ fetch, params }) {
	const id = params.id;

	const url = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });
	const response = await fetch(url);

	if (!response.ok) {
		fail(response.status, { error: "Failed to fetch the puzzle." });
	}

	const puzzle: PuzzleEntity = await response.json();

	const validate = await superValidate(
		puzzle,
		zod(puzzleEntitySchema.omit({ authorId: true, createdAt: true, updatedAt: true }))
	);

	return {
		form: validate
	};
}

export const actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(puzzleEntitySchema));

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
		const response = await fetch(updateUrl, {
			method: PUT,
			headers: {
				Cookie: cookie,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body),
			credentials: "include"
		});

		if (!response.ok) {
			fail(response.status, { form, error: "Failed to update the puzzle." });
		}

		// Display a success status message
		return message(form, "Form updated successfully!");
	}
};
