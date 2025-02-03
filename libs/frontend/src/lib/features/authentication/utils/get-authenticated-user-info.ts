import jwt from "jsonwebtoken";
import { httpRequestMethod, isAuthenticatedInfo } from "types";
import { logout } from "./logout";
import type { Cookies } from "@sveltejs/kit";
import { apiUrls } from "@/config/api";

export async function getAuthenticatedUserInfo(
	token: string,
	cookies: Cookies,
	eventFetch = fetch
) {
	try {
		const response = await eventFetch(apiUrls.VERIFY_TOKEN, {
			body: JSON.stringify({ token }),
			method: httpRequestMethod.POST
		});

		const authenticatedInfo = await response.json();

		if (isAuthenticatedInfo(authenticatedInfo)) {
			return authenticatedInfo;
		}
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			logout(cookies);

			return {
				isAuthenticated: false
			};
		} else if (err instanceof jwt.JsonWebTokenError) {
			console.error("Invalid token:", err);
			return {
				error: "Invalid token",
				isAuthenticated: false
			};
		} else if (err instanceof jwt.NotBeforeError) {
			console.error("Token not active yet:", err);
			return {
				error: "Token not active",
				isAuthenticated: false
			};
		} else {
			console.error("Error verifying token:", err);
		}
	}

	return {
		isAuthenticated: false
	};
}
