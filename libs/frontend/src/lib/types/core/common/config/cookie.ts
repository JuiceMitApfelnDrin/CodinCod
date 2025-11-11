import type { ValueOf } from "@codincod/shared/types/value-of";

export const cookieKeys = {
	TOKEN: "token"
} as const;

export type CookieKey = ValueOf<typeof cookieKeys>;

export const cookieSameSiteValues = {
	LAX: "lax",
	STRICT: "strict",
	NONE: "none"
} as const;

export type CookieSameSite = ValueOf<typeof cookieSameSiteValues>;
