import { backendUrls, httpRequestMethod } from "types";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";
import type { RequestEvent } from "./$types";

export async function GET({ params, request }: RequestEvent) {
	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.submissionById(params.id)),
		{
			headers: getCookieHeader(request),
			method: httpRequestMethod.GET
		}
	);
}
