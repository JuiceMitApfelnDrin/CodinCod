import { buildBackendUrl } from "@/config/backend";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";

export async function GET({ params, request }: RequestEvent) {
	return fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.userByUsername(params.username)),
		{
			headers: getCookieHeader(request),
			method: httpRequestMethod.GET
		}
	);
}
