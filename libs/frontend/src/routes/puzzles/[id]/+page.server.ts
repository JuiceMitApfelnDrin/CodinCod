import { buildBackendUrl } from "@/config/backend.js";
import { backendUrls } from "types";

export async function load({ fetch, params }) {
	const id = params.id;
	const url = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });

	const res = await fetch(url);
	const puzzle = await res.json();

	return { puzzle };
}
