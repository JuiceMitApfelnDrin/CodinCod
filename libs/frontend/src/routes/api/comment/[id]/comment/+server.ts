import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "../vote/$types";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";

export async function POST({ params, request }: RequestEvent) {
	const body = await request.text();

	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.COMMENT_BY_ID_COMMENT, {
			id: params.id
		}),
		{
			body,
			headers: getCookieHeader(request),
			method: httpRequestMethod.POST
		}
	);
}
