import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { redirect, type RequestEvent } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { backendUrls, DELETE, deletePuzzleSchema, frontendUrls, httpResponseCodes } from "types";

export async function handleDeletePuzzleForm({ request }: RequestEvent) {
	const deletePuzzleForm = await superValidate(request, zod(deletePuzzleSchema));

	if (!deletePuzzleForm.valid) {
		// Again, return { form } and things will just work.
		fail(400, { deletePuzzleForm });
	}

	const cookie = request.headers.get("cookie") || "";

	// Prepare the url
	const id = deletePuzzleForm.data.id;
	const deletePuzzleUrl = buildBackendUrl(backendUrls.puzzleById(id));

	// Update puzzle data to backend
	const response = await fetchWithAuthenticationCookie(deletePuzzleUrl, {
		headers: {
			"Content-Type": "application/json",
			Cookie: cookie
		},
		method: DELETE
	});

	if (!response.ok) {
		fail(response.status, { deletePuzzleForm, error: "Failed to delete the puzzle." });
	}

	if (response.ok) {
		redirect(httpResponseCodes.REDIRECTION.SEE_OTHER, frontendUrls.PUZZLES);
	}

	// Display a success status message
	return { deletePuzzleForm, message: "Puzzle deleted successfully!", success: true };
}
