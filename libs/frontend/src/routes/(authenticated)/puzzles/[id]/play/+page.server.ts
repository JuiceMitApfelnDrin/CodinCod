import { codincodApiWebAccountControllerShow } from "@/api/generated/account/account";
import { codincodApiWebPuzzleControllerShow } from "@/api/generated/puzzle/puzzle";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoadEvent } from "./$types";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;

	try {
		await codincodApiWebAccountControllerShow({ fetch } as RequestInit);
	} catch {
		throw redirect(302, frontendUrls.LOGIN);
	}

	try {
		const puzzle = await codincodApiWebPuzzleControllerShow(id, {
			fetch
		} as RequestInit);

		return { puzzle };
	} catch (err) {
		console.error("Failed to load puzzle:", err);
		throw error(500, "Failed to fetch the puzzle.");
	}
}
