import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";

export async function POST({ request }: RequestEvent) {
	const body = await request.text();

	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.EXECUTE), {
		body: body,
		method: httpRequestMethod.POST
	});
}
