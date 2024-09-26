import { buildBackendUrl } from "@/config/backend";
import { backendUrls, POST } from "types";
import { fetchWithAuthenticationCookie } from "../../utils/fetch-with-authentication-cookie";

export async function login(identifier: string, password: string) {
	return fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.LOGIN), {
		body: JSON.stringify({ identifier, password }),
		headers: {
			"Content-Type": "application/json"
		},
		method: POST
	});
}
