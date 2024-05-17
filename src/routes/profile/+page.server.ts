import { backend_routes, buildBackendUrl } from '@/config/backend';

export async function load({ fetch }) {
	const url = buildBackendUrl(backend_routes.account);

	const res = await fetch(url);
	const data = await res.json();

	return data;
}
