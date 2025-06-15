import type { PageServerLoadEvent } from "./$types";
import { httpRequestMethod, type PaginatedQueryResponse } from "types";
import { apiUrls, buildApiUrl } from "@/config/api";

export async function load({ fetch, params, request, url }: PageServerLoadEvent) {
	const username = params.username;

	const apiUrl = buildApiUrl(apiUrls.USER_BY_USERNAME_PUZZLE, { username });

	const apiUrlWithQueryParams = new URL(apiUrl, request.url);
	apiUrlWithQueryParams.search = url.search;

	const res = await fetch(apiUrlWithQueryParams, {
		method: httpRequestMethod.GET
	});

	const paginatedPuzzles: PaginatedQueryResponse = await res.json();

	return { ...paginatedPuzzles };
}
