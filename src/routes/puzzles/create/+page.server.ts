import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "../$types";
import { zod } from "sveltekit-superforms/adapters";
import { createPuzzleFormSchema } from "@/features/puzzles/config/createPuzzleFormSchema";

export const load: PageServerLoad = async () => {
	const validate = await superValidate(zod(createPuzzleFormSchema));

	return {
		form: validate
	};
};
