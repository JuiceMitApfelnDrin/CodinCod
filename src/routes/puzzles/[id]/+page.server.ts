import { backend_routes, buildBackendUrl } from '@/config/backend.js';

export async function load({ fetch, params }) {
	const url = buildBackendUrl(backend_routes.puzzle_by_id, { id: params.id });

	const res = await fetch(url);
	const puzzle = await res.json();

	return { puzzle };
}
