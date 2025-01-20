import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, GET } from "types";

export async function getUserActivityByUsername(username: string) {
	return fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.USER_BY_USERNAME_ACTIVITY, { username }),
		{
			headers: {
				"Content-Type": "application/json"
			},
			method: GET
		}
	);
}
