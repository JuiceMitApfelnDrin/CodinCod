import type { CookieSameSite } from "../config/cookie.js";
export type CookieOptions = {
	path: string;
	httpOnly: boolean;
	secure: boolean;
	sameSite: CookieSameSite;
	domain?: string;
	maxAge?: number;
};
