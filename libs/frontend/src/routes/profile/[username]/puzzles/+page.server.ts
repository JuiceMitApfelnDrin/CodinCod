import { codincodApiWebUserControllerPuzzles2 } from "$lib/api/generated";
import type { PageServerLoadEvent } from "./$types";

export async function load({
	fetch,
	params,
	request,
	url
}: PageServerLoadEvent) {
	const username = params.username;

	// Parse query params
	const page = url.searchParams.get("page");
	const pageSize = url.searchParams.get("pageSize");
	const difficulty = url.searchParams.get("difficulty");
	const search = url.searchParams.get("search");

	const paginatedPuzzles = await codincodApiWebUserControllerPuzzles2(
		username,
		{
			...(page && { page: parseInt(page) }),
			...(pageSize && { pageSize: parseInt(pageSize) }),
			...(difficulty && { difficulty }),
			...(search && { search })
		}
	);

	return { ...paginatedPuzzles };
}
