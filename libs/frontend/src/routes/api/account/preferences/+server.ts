import { httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls } from "types";
import { buildBackendUrl } from "@/config/backend";

export async function POST({ request }: RequestEvent) {
	const body = await request.text();

	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.ACCOUNT_PREFERENCES), {
		body: body,
		headers: getCookieHeader(request),
		method: httpRequestMethod.POST
	});
}

export async function PUT({ request }: RequestEvent) {
	const body = await request.text();

	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.ACCOUNT_PREFERENCES), {
		body: body,
		headers: getCookieHeader(request),
		method: httpRequestMethod.PUT
	});
}

export async function GET({ request }: RequestEvent) {
	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.ACCOUNT_PREFERENCES), {
		headers: getCookieHeader(request),
		method: httpRequestMethod.GET
	});
}

export async function DELETE({ request }: RequestEvent) {
	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.ACCOUNT_PREFERENCES), {
		headers: getCookieHeader(request),
		method: httpRequestMethod.DELETE
	});
}
