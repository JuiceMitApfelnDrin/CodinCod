import { buildBackendUrl } from "@/config/backend";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader,
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";

export async function POST({ params, request }: RequestEvent) {
	const { id } = params;
	const body = await request.json();

	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.moderationReportResolve(id)),
		{
			headers: getCookieHeader(request),
			method: httpRequestMethod.POST,
			body: JSON.stringify(body),
		}
	);
}
