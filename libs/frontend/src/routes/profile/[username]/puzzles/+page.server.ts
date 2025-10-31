import type { PageServerLoadEvent } from "./$types";
import { httpRequestMethod, type PaginatedQueryResponse } from "types";
import { buildBackendUrl } from "@/config/backend";
import { backendUrls } from "types";

export async function load({
	fetch,
	params,
	request,
	url
}: PageServerLoadEvent) {
	const username = params.username;

	const apiUrl = buildBackendUrl(backendUrls.userByUsernamePuzzle(username));

	const apiUrlWithQueryParams = new URL(apiUrl, request.url);
	apiUrlWithQueryParams.search = url.search;

	const res = await fetch(apiUrlWithQueryParams, {
		method: httpRequestMethod.GET
	});

	const paginatedPuzzles: PaginatedQueryResponse = await res.json();

	return { ...paginatedPuzzles };
}
