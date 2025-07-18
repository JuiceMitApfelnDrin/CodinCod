import { buildBackendUrl } from "@/config/backend.js";
import { error } from "@sveltejs/kit";
import { backendUrls, type PuzzleDto } from "types";
import type { PageServerLoadEvent } from "./$types";

export async function load({ fetch, params }: PageServerLoadEvent) {
	const id = params.id;
	const url = buildBackendUrl(backendUrls.puzzleById(id));

	try {
		const response = await fetch(url);

		if (!response.ok) {
			error(response.status, "Failed to fetch the puzzle.");
		}

		const puzzle: PuzzleDto = await response.json();

		return { puzzle };
	} catch {
		error(500, "Server error occurred while attempting to fetch the puzzle.");
	}
}
