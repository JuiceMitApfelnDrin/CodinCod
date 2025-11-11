import { puzzleFormSchema } from "$lib/schemas/puzzle-form.schema.js";
import { ERROR_MESSAGES } from "$lib/types/core/common/config/error-messages.js";
import { httpResponseCodes } from "$lib/types/core/common/enum/http-response-codes.js";
import { deletePuzzleSchema } from "$lib/types/core/puzzle/schema/delete-puzzle.schema.js";
import {
	codincodApiWebPuzzleControllerDelete,
	codincodApiWebPuzzleControllerSolution,
	codincodApiWebPuzzleControllerUpdate
} from "@/api/generated/puzzle/puzzle";
import { isSvelteKitRedirect } from "@/features/authentication/utils/is-sveltekit-redirect";
import { logger } from "@/utils/debug-logger.js";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { error, fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { PageServerLoadEvent, RequestEvent } from "./$types.js";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;
	console.log("[SERVER] Loading puzzle edit page for ID:", id);
	logger.page("Loading puzzle edit page", { id });

	try {
		const puzzleData = await codincodApiWebPuzzleControllerSolution(id, {
			fetch
		} as RequestInit);

		console.log("[SERVER] Puzzle loaded successfully:", puzzleData.title);
		logger.page("Puzzle loaded", { title: puzzleData.title, id });

		const formData = {
			title: puzzleData.title ?? "",
			description: puzzleData.statement ?? null,
			constraints: puzzleData.constraints ?? null,
			difficulty:
				(puzzleData.difficulty as
					| "beginner"
					| "easy"
					| "medium"
					| "hard"
					| "expert"
					| null) ?? null,
			tags: puzzleData.tags ?? null,
			validators:
				puzzleData.validators?.map((v) => ({
					input: v.input ?? "",
					output: v.output ?? ""
				})) ?? null
		};

		const validate = await superValidate(formData, zod4(puzzleFormSchema));
		const validateDeletePuzzle = await superValidate(
			{ id },
			zod4(deletePuzzleSchema)
		);

		return {
			deletePuzzle: validateDeletePuzzle,
			form: validate,
			puzzle: puzzleData
		};
	} catch (err) {
		console.error("[SERVER] Failed to load puzzle:", err);
		logger.error("Failed to load puzzle", err);

		if (err instanceof Error) {
			throw error(500, err.message || "Failed to fetch the puzzle.");
		}
		throw error(500, "Failed to fetch the puzzle.");
	}
}

export const actions = {
	deletePuzzle: async ({ params, request, fetch }: RequestEvent) => {
		const deletePuzzleForm = await superValidate(
			request,
			zod4(deletePuzzleSchema)
		);

		if (!deletePuzzleForm.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				deletePuzzleForm
			});
		}

		const id = deletePuzzleForm.data.id;

		try {
			await codincodApiWebPuzzleControllerDelete(
				id as string,
				{ fetch } as RequestInit
			);

			throw redirect(
				httpResponseCodes.REDIRECTION.SEE_OTHER,
				frontendUrls.PUZZLES
			);
		} catch (error: unknown) {
			// Re-throw redirect errors
			if (isSvelteKitRedirect(error)) {
				throw error;
			}

			return fail(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
				deletePuzzleForm,
				error: ERROR_MESSAGES.PUZZLE.FAILED_TO_DELETE
			});
		}
	},
	editPuzzle: async ({ params, request, fetch }: RequestEvent) => {
		const form = await superValidate(request, zod4(puzzleFormSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, { form });
		}

		const id = params.id;
		const requestBody = form.data;

		try {
			await codincodApiWebPuzzleControllerUpdate(id, requestBody, {
				fetch
			} as RequestInit);
			return message(form, "Form updated successfully!");
		} catch (error: unknown) {
			return fail(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
				error: ERROR_MESSAGES.PUZZLE.FAILED_TO_UPDATE,
				form
			});
		}
	}
};
