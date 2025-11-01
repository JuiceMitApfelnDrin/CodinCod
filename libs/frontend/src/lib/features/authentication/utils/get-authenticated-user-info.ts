import { httpRequestMethod, backendUrls, cookieKeys } from "types";
import type { Cookies } from "@sveltejs/kit";
import { buildBackendUrl } from "@/config/backend";

export async function getAuthenticatedUserInfo(
	cookies: Cookies,
	eventFetch = fetch
) {
	try {
		const url = buildBackendUrl(backendUrls.ACCOUNT);

		// Get the token cookie to forward to the backend
		const token = cookies.get(cookieKeys.TOKEN);

		if (!token) {
			return {
				isAuthenticated: false
			};
		}

		const headers: HeadersInit = {
			"Content-Type": "application/json",
			// Forward the cookie to the backend
			Cookie: `${cookieKeys.TOKEN}=${token}`
		};

		const response = await eventFetch(url, {
			method: httpRequestMethod.GET,
			headers
		});

		if (!response.ok) {
			if (response.status === 401) {
				// Token is invalid, just return unauthenticated
				return {
					isAuthenticated: false
				};
			}
			console.error(
				`Failed to verify authentication: ${response.status} ${response.statusText} from ${url}`
			);
			const errorBody = await response
				.text()
				.catch(() => "Unable to read response body");
			console.error("Response body:", errorBody);
			throw new Error(
				`Failed to verify authentication: ${response.status} ${response.statusText}`
			);
		}

		const authenticatedInfo = await response.json();

		if (authenticatedInfo.isAuthenticated) {
			return authenticatedInfo;
		}
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error verifying authentication:", err.message);
			if ("cause" in err) {
				console.error("Error cause:", err.cause);
			}
		} else {
			console.error("Error verifying authentication:", err);
		}
	}

	return {
		isAuthenticated: false
	};
}
