import { codincodApiWebAccountControllerShow2 } from "@/api/generated/account/account";
import { codincodApiWebPuzzleControllerShow2 } from "@/api/generated/puzzle/puzzle";
import { error } from "@sveltejs/kit";
import type { PageServerLoadEvent } from "./$types";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;

	try {
		// Use generated Orval endpoints
		const puzzle = await codincodApiWebPuzzleControllerShow2(id, {
			fetch
		} as RequestInit);

		// Load account info (optional - will return null if not authenticated)
		let account = null;

		try {
			account = await codincodApiWebAccountControllerShow2({
				fetch
			} as RequestInit);
		} catch {
			// User not authenticated, account stays null
		}

		return { puzzle, account };
	} catch (err) {
		console.error("Failed to load puzzle:", err);
		throw error(500, "Failed to load puzzle");
	}
}
