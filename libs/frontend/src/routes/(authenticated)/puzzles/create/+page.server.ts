import { ApiError } from "$lib/api/errors";
import { logger } from "$lib/utils/debug-logger";
import { codincodApiWebPuzzleControllerCreate } from "@/api/generated/puzzle/puzzle";
import { isSvelteKitRedirect } from "@/features/authentication/utils/is-sveltekit-redirect";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import {
	createPuzzleSchema,
	ERROR_MESSAGES,
	frontendUrls,
	httpResponseCodes
} from "$lib/types";
import type { RequestEvent } from "./$types.js";

export async function load() {
	logger.page("Create puzzle page load");
	const form = await superValidate(zod4(createPuzzleSchema));

	return { form };
}

export const actions = {
	default: async ({ request, fetch }: RequestEvent) => {
		logger.form("📝 Create puzzle form submitted");

		const form = await superValidate(request, zod4(createPuzzleSchema));

		if (!form.valid) {
			logger.form("❌ Form validation failed", form.errors);
			return fail(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST, {
				form,
				message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS
			});
		}

		logger.form("Form data valid", form.data);

		try {
			logger.api("Calling puzzle create endpoint with puzzle data", form.data);

			const data = await codincodApiWebPuzzleControllerCreate(form.data, {
				fetch
			} as RequestInit);

			logger.api("✅ Puzzle created successfully", data);

			const editPuzzleUrl = frontendUrls.puzzleByIdEdit(data._id!);
			logger.page(`Redirecting to edit page: ${editPuzzleUrl}`);

			throw redirect(httpResponseCodes.REDIRECTION.FOUND, editPuzzleUrl);
		} catch (error: unknown) {
			// Re-throw redirect errors
			if (isSvelteKitRedirect(error)) {
				logger.form("Redirecting after successful puzzle creation");
				throw error;
			}

			const status =
				error instanceof ApiError
					? error.status
					: httpResponseCodes.CLIENT_ERROR.BAD_REQUEST;

			const errorMessage =
				error instanceof ApiError
					? error.data.message
					: error instanceof Error
						? error.message
						: "An unexpected error occurred";

			logger.error("Failed to create puzzle", {
				error,
				status,
				message: errorMessage
			});

			return fail(status, {
				form,
				message:
					error instanceof ApiError
						? error.data.message
						: ERROR_MESSAGES.PUZZLE.FAILED_TO_CREATE
			});
		}
	}
};
