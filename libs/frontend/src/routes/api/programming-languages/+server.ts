import { backendUrls, httpRequestMethod } from "types";
import { buildBackendUrl } from "@/config/backend";
import type { RequestEvent } from "./$types";
import { getCookieHeader } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { json } from "@sveltejs/kit";

export async function GET({ fetch, request }: RequestEvent) {
	const response = await fetch(
		buildBackendUrl(backendUrls.PROGRAMMING_LANGUAGE),
		{
			headers: getCookieHeader(request),
			method: httpRequestMethod.GET
		}
	);

	const { languages } = await response.json();

	return json({ languages });
}
