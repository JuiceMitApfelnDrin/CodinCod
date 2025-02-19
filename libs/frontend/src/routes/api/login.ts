import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, POST } from "types";

export async function login(identifier: string, password: string) {
	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.LOGIN), {
		body: JSON.stringify({ identifier, password }),
		method: POST
	});
}
