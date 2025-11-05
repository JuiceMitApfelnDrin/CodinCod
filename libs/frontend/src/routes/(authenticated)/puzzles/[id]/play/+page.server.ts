import { codincodApiWebAccountControllerShow2 } from "@/api/generated/account/account";
import { codincodApiWebPuzzleControllerShow2 } from "@/api/generated/puzzle/puzzle";
import { error, redirect } from "@sveltejs/kit";
import { frontendUrls } from "types";
import type { PageServerLoadEvent } from "./$types";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;

	// Require authentication for playing puzzles
	try {
		await codincodApiWebAccountControllerShow2({ fetch } as RequestInit);
	} catch {
		throw redirect(302, frontendUrls.LOGIN);
	}

	try {
		// Load puzzle data - use generated Orval endpoint
		const puzzle = await codincodApiWebPuzzleControllerShow2(id, {
			fetch
		} as RequestInit);

		return { puzzle };
	} catch (err) {
		console.error("Failed to load puzzle:", err);
		throw error(500, "Failed to fetch the puzzle.");
	}
}
