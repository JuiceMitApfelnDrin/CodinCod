import { buildBackendUrl } from "@/config/backend";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";

export async function GET({ params, request, url }: RequestEvent) {
	const username = params.username;
	const userPuzzlesByUsernameUrl = buildBackendUrl(
		backendUrls.userByUsernamePuzzle(username)
	);

	return fetchWithAuthenticationCookie(userPuzzlesByUsernameUrl + url.search, {
		headers: getCookieHeader(request),
		method: httpRequestMethod.GET
	});
}
