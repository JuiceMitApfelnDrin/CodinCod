import { loadWithFallback } from "$lib/api/error-handler";
import { codincodApiWebAccountControllerShow } from "@/api/generated/account/account";
import { codincodApiWebPuzzleControllerIndex } from "@/api/generated/puzzle/puzzle";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ fetch, url }: ServerLoadEvent) {
	// Build query params
	const page = url.searchParams.get("page") || "1";
	const pageSize = url.searchParams.get("pageSize") || "20";
	const difficulty = url.searchParams.get("difficulty");
	const search = url.searchParams.get("search");

	const puzzles = await codincodApiWebPuzzleControllerIndex({
		page: parseInt(page),
		pageSize: parseInt(pageSize),
		...(difficulty && { difficulty }),
		...(search && { search })
	}, {fetch} as RequestInit);

	// Load current user account info (optional, won't break page if not authenticated)
	const account = await loadWithFallback(
		() => codincodApiWebAccountControllerShow({fetch} as RequestInit),
		null
	);

	return {
		puzzles,
		account
	};
}
