import { buildBackendUrl } from "@/config/backend.js";
import { backendUrls, httpResponseCodes } from "types";
import type { PageServerLoadEvent } from "./$types";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;
	const url = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });

	const response = await fetch(url);
	const puzzle = await response.json();

	if (response.status === httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR) {
		throw error(response.status, puzzle.error);
	}

	return { puzzle };
}
