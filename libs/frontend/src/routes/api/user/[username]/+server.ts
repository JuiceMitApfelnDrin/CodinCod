import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";

export async function GET({ params }: RequestEvent) {
	const username = params.username;
	const userByUsernameUrl = buildBackendUrl(backendUrls.USER_BY_USERNAME, { username });

	return fetchWithAuthenticationCookie(userByUsernameUrl, {
		method: httpRequestMethod.GET
	});
}
