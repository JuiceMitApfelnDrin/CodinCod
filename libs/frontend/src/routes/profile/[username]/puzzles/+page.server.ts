import type { PageServerLoadEvent } from "./$types";
import { httpRequestMethod, type PuzzleAPI } from "types";
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

	const paginatedPuzzles: PuzzleAPI.GetPuzzlesResponse = await res.json();

	return { ...paginatedPuzzles };
}
