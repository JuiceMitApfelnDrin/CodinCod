import { backendUrls, httpRequestMethod, type PuzzleLanguage } from "types";
import { buildBackendUrl } from "@/config/backend";
import type { RequestEvent } from "./$types";
import { getCookieHeader } from "@/features/authentication/utils/fetch-with-authentication-cookie";

export async function GET({ fetch, request }: RequestEvent) {
	const response = await fetch(buildBackendUrl(backendUrls.PUZZLE_LANGUAGES), {
		headers: getCookieHeader(request),
		method: httpRequestMethod.GET
	});

	return response;
}
