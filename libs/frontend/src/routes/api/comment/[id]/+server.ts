import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";

export async function GET({ params, request }: RequestEvent) {
	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.COMMENT_BY_ID, {
			id: params.id
		}),
		{
			headers: getCookieHeader(request),
			method: httpRequestMethod.GET
		}
	);
}
