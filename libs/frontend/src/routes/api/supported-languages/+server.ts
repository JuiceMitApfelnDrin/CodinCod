import { backendUrls, httpRequestMethod } from "types";
import { buildBackendUrl } from "@/config/backend";
import type { RequestEvent } from "./$types";
import { getCookieHeader } from "@/features/authentication/utils/fetch-with-authentication-cookie";

export async function GET({ fetch, request }: RequestEvent) {
	const supportedPuzzleLanguages = fetch(buildBackendUrl(backendUrls.PUZZLE_LANGUAGES), {
		headers: getCookieHeader(request),
		method: httpRequestMethod.GET
	});

	return supportedPuzzleLanguages;
}
