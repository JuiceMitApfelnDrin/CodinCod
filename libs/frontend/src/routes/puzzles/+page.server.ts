import { loadWithFallback } from "$lib/api/error-handler";
import {
	codincodApiWebAccountControllerShow,
	codincodApiWebPuzzleControllerIndex
} from "$lib/api/generated";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ fetch, url }: ServerLoadEvent) {
	// Build query params
	const page = url.searchParams.get("page") || "1";
	const pageSize = url.searchParams.get("pageSize") || "20";
	const difficulty = url.searchParams.get("difficulty");
	const search = url.searchParams.get("search");

	// Use the generated endpoint with params
	const puzzles = await codincodApiWebPuzzleControllerIndex({
		page: parseInt(page),
		pageSize: parseInt(pageSize),
		...(difficulty && { difficulty }),
		...(search && { search })
	});

	// Load current user account info (optional, won't break page if not authenticated)
	const account = await loadWithFallback(
		() => codincodApiWebAccountControllerShow(),
		null
	);

	return {
		puzzles,
		account
	};
}
