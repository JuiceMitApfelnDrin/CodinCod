import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { backend_routes, buildBackendUrl } from "@/config/backend";
import { editPuzzleFormSchema } from "@/features/puzzles/config/editPuzzleFormSchema.js";

export async function load({ fetch, params }) {
	const url = buildBackendUrl(backend_routes.puzzle_by_id, { id: params.id });

	const res = await fetch(url);
	const puzzle = await res.json();

	const validate = await superValidate(zod(editPuzzleFormSchema));

	return {
		puzzle,
		form: validate
	};
}
