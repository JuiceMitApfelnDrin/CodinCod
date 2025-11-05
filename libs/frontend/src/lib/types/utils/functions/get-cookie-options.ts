import type { CookieOptions } from "../../core/common/types/cookie-options.js";

export function getCookieOptions(options: {
	isProduction: boolean;
	frontendHost?: string | undefined;
	maxAge?: number | undefined;
}): CookieOptions {
	const { isProduction, frontendHost, maxAge } = options;

	const cookieOptions: CookieOptions = {
		path: "/",
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
	};

	if (isProduction && frontendHost) {
		cookieOptions.domain = frontendHost;
	}

	if (maxAge !== undefined) {
		cookieOptions.maxAge = maxAge;
	}

	return cookieOptions;
}
