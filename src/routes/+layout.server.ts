import { redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { frontendUrls, type JwtPayload } from "types";

export const load = async (event) => {
	const unProtectedRoutes: string[] = [
		frontendUrls.ROOT,
		frontendUrls.REGISTER,
		frontendUrls.LOGIN
	];

	const token = event.cookies.get("token");

	let currentUser: JwtPayload | null = null;

	if (token) {
		try {
			const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;

			if (!JWT_SECRET) {
				throw new Error("Forgot environment variable VITE_JWT_SECRET in .env");
			}

			currentUser = jwt.verify(token, JWT_SECRET) as JwtPayload;
		} catch (err) {
			if (!unProtectedRoutes.includes(event.url.pathname)) {
				throw redirect(303, frontendUrls.LOGIN);
			}
		}
	} else {
		if (!unProtectedRoutes.includes(event.url.pathname)) {
			throw redirect(303, frontendUrls.LOGIN);
		}
	}

	const query = event.url.searchParams.get("signout");
	if (Boolean(query) === true) {
		event.cookies.delete("token", { path: "/" });
	}

	if (currentUser) {
		return {
			userInfo: {
				isAuthenticated: true,
				...currentUser
			}
		};
	} else {
		return {
			userInfo: {
				isAuthenticated: false
			}
		};
	}
};
