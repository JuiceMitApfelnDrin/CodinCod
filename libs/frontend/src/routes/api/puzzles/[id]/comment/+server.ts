import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";

export async function POST({ params, request }: RequestEvent) {
	const body = await request.text();

	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.PUZZLE_DETAIL_COMMENT, {
			id: params.id
		}),
		{
			body,
			headers: getCookieHeader(request),
			method: httpRequestMethod.POST
		}
	);
}
