import { cookieKeys, environment } from "types";

export const AUTH_CONFIG = {
	JWT: {
		get SECRET() {
			return process.env.JWT_SECRET || "your_jwt_secret_here";
		},
		get EXPIRY() {
			return process.env.JWT_EXPIRY || "7d";
		}
	},
	COOKIE: {
		NAME: cookieKeys.TOKEN,
		get OPTIONS() {
			return {
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === environment.PRODUCTION,
				sameSite:
					process.env.NODE_ENV === environment.PRODUCTION
						? ("none" as const)
						: ("lax" as const),
				domain: process.env.FRONTEND_HOST ?? "localhost",
				maxAge: 3600 // 1 hour in seconds
			};
		}
	},
	RATE_LIMIT: {
		AUTH_ENDPOINTS: {
			max: 5, // 5 attempts per window
			timeWindow: "15 minutes"
		},
		GENERAL: {
			max: 100,
			timeWindow: "1 minute"
		}
	}
} as const;

export function validateAuthConfig(): void {
	if (
		!AUTH_CONFIG.JWT.SECRET ||
		AUTH_CONFIG.JWT.SECRET === "your_jwt_secret_here"
	) {
		throw new Error("JWT_SECRET must be set to a secure value in production");
	}

	if (
		process.env.NODE_ENV === environment.PRODUCTION &&
		AUTH_CONFIG.JWT.SECRET.length < 32
	) {
		throw new Error(
			"JWT_SECRET must be at least 32 characters long in production"
		);
	}
}
