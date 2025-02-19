import { buildBackendUrl } from "@/config/backend.js";
import { backendUrls } from "types";
import type { PageServerLoadEvent } from "./$types";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;
	const url = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });

	const response = await fetch(url);
	const puzzle = await response.json();

	return { puzzle };
}
