import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, httpRequestMethod } from "types";

export async function login(identifier: string, password: string) {
	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.LOGIN), {
		body: JSON.stringify({ identifier, password }),
		method: httpRequestMethod.POST
	});
}
