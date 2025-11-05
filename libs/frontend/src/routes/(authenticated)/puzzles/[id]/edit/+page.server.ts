import { logger } from "$lib/utils/debug-logger";
import {
	codincodApiWebPuzzleControllerDelete2,
	codincodApiWebPuzzleControllerSolution2,
	codincodApiWebPuzzleControllerUpdate2
} from "@/api/generated/puzzle/puzzle";
import type { PuzzleCreateRequest } from "@/api/generated/schemas/puzzleCreateRequest";
import type { PuzzleResponse } from "@/api/generated/schemas/puzzleResponse";
import { isSvelteKitRedirect } from "@/features/authentication/utils/is-sveltekit-redirect";
import { error, fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { EditPuzzle } from "types";
import {
	deletePuzzleSchema,
	editPuzzleSchema,
	ERROR_MESSAGES,
	frontendUrls,
	httpResponseCodes,
	puzzleVisibilityEnum
} from "types";
import type { PageServerLoadEvent, RequestEvent } from "./$types.js";

/**
 * Transform PuzzleResponse from API to a plain object for form validation
 */
function transformPuzzleForEdit(puzzle: PuzzleResponse) {
	// Map visibility string to enum value
	const visibilityKey = (
		puzzle.visibility ?? "draft"
	).toUpperCase() as keyof typeof puzzleVisibilityEnum;
	const visibility =
		puzzleVisibilityEnum[visibilityKey] ?? puzzleVisibilityEnum.DRAFT;

	const formData = {
		title: puzzle.title ?? "",
		statement: puzzle.statement ?? "",
		visibility,
		constraints: puzzle.constraints ?? undefined,
		validators:
			puzzle.validators?.map((v) => ({
				input: v.input ?? "",
				output: v.output ?? "",
				createdAt: new Date(),
				updatedAt: new Date()
			})) ?? [],
		solution: puzzle.solution
			? {
					code: puzzle.solution.code ?? "",
					programmingLanguage: puzzle.solution.programmingLanguage ?? undefined
				}
			: { code: "", programmingLanguage: undefined },
		createdAt: puzzle.createdAt ? new Date(puzzle.createdAt) : undefined,
		updatedAt: puzzle.updatedAt ? new Date(puzzle.updatedAt) : undefined,
		author:
			typeof puzzle.author === "string"
				? puzzle.author
				: (puzzle.author?._id ?? "")
	};
	return formData;
}

/**
 * Transform edit form data to API CreateRequest format
 */
function transformEditToCreateRequest(data: EditPuzzle): PuzzleCreateRequest {
	return {
		title: data.title,
		description: data.statement || null,
		constraints: data.constraints || null,
		validators:
			data.validators && data.validators.length > 0
				? data.validators.map((v) => ({
						input: v.input,
						output: v.output
					}))
				: null
	};
}

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;
	console.log("[SERVER] Loading puzzle edit page for ID:", id);
	logger.page("Loading puzzle edit page", { id });

	try {
		// Use generated Orval endpoint with server-side fetch
		const puzzle = await codincodApiWebPuzzleControllerSolution2(id, {
			fetch
		} as RequestInit);

		console.log("[SERVER] Puzzle loaded successfully:", puzzle.title);
		logger.page("Puzzle loaded", { title: puzzle.title, id });

		// Transform API response to match edit schema
		const puzzleData = transformPuzzleForEdit(puzzle);

		const validate = await superValidate(puzzleData, zod4(editPuzzleSchema));
		const validateDeletePuzzle = await superValidate(
			{ id },
			zod4(deletePuzzleSchema)
		);

		return {
			deletePuzzle: validateDeletePuzzle,
			form: validate
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
			await codincodApiWebPuzzleControllerDelete2(
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
		const form = await superValidate(request, zod4(editPuzzleSchema));

		if (!form.valid) {
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, { form });
		}

		const id = params.id;
		const requestBody = transformEditToCreateRequest(form.data);

		try {
			await codincodApiWebPuzzleControllerUpdate2(id, requestBody, {
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
