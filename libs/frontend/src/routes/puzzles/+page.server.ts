import { buildBackendUrl } from "@/config/backend.js";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { backendUrls, type PaginatedQueryResponse } from "types";

export async function load({ fetch, url }: ServerLoadEvent) {
	const apiUrl = buildBackendUrl(backendUrls.PUZZLE);
	const apiUrlWithQueryParams = new URL(apiUrl);

	apiUrlWithQueryParams.search = url.search;

	const res = await fetch(apiUrlWithQueryParams);
	const paginatedPuzzles: PaginatedQueryResponse = await res.json();

	return { ...paginatedPuzzles };
}
