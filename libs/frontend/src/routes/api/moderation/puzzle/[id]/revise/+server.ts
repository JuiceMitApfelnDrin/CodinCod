import { buildBackendUrl } from "@/config/backend";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader,
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";

export async function POST({ params, request }: RequestEvent) {
	const { id } = params;

	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.moderationPuzzleRevise(id)),
		{
			headers: getCookieHeader(request),
			method: httpRequestMethod.POST,
			body: JSON.stringify({}),
		}
	);
}
