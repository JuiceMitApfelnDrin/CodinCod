import jwt from "jsonwebtoken";
import { isAuthenticatedInfo } from "types";

export function getAuthenticatedUserInfo(token: string | undefined) {
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
			console.error("Error verifying token:", err);
		}
	}

	return {
		isAuthenticated: false
	};
}
