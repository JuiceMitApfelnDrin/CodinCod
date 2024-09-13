import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/utils/fetch-with-authentication-cookie";
import { backendUrls, POST } from "types";

export async function login(identifier: string, password: string) {
	return await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.LOGIN), {
		body: JSON.stringify({ identifier, password }),
		headers: {
			"Content-Type": "application/json"
		},
		method: POST
	});
}
