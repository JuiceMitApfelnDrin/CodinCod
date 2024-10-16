import jwt from "jsonwebtoken";
import { isAuthenticatedInfo } from "types";
import { logout } from "./logout";
import type { Cookies } from "@sveltejs/kit";

export function getAuthenticatedUserInfo(token: string | undefined, cookies: Cookies) {
	if (token) {
		const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;

		if (!JWT_SECRET) {
			throw new Error("Forgot environment variable VITE_JWT_SECRET in .env");
		}

		try {
			const authenticatedInfo = jwt.verify(token, JWT_SECRET);

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
					isAuthenticated: false,
					error: "Invalid token"
				};
			} else if (err instanceof jwt.NotBeforeError) {
				console.error("Token not active yet:", err);
				return {
					isAuthenticated: false,
					error: "Token not active"
				};
			} else {
				console.error("Error verifying token:", err);
			}
		}
	}

	return {
		isAuthenticated: false
	};
}
