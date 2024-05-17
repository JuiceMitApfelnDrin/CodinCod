import { backend_routes, buildBackendUrl } from "@/config/backend.js";

export async function load({ fetch }) {
	const url = buildBackendUrl(backend_routes.puzzles);

	const res = await fetch(url);
	const puzzles = await res.json();

	return { puzzles };
}
