import { ValueOf } from "../types/value-of.js";

export const cookieKeys = {
	TOKEN: "token",
} as const;

export type CookieKey = ValueOf<typeof cookieKeys>;

export const cookieSameSiteValues = {
	LAX: "lax",
	STRICT: "strict",
	NONE: "none",
} as const;

export type CookieSameSite = ValueOf<typeof cookieSameSiteValues>;
