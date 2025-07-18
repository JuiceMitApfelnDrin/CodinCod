import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";

export async function GET({ params, request }: RequestEvent) {
	return await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.commentById(params.id)), {
		headers: getCookieHeader(request),
		method: httpRequestMethod.GET
	});
}

export async function DELETE({ params, request }: RequestEvent) {
	return await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.commentById(params.id)), {
		headers: getCookieHeader(request),
		method: httpRequestMethod.DELETE
	});
}
