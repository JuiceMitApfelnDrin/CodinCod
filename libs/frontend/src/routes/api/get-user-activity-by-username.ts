import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls } from "types";

export async function getUserActivityByUsername(username: string) {
	return fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.userByUsernameActivity(username))
	);
}
