import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";
import { AUTH_CONFIG } from "../../config/auth.config.js";

export default fastifyPlugin(async function authRateLimit(
	fastify: FastifyInstance
) {
	// Rate limit for authentication endpoints
	await fastify.register(fastifyRateLimit, {
		max: AUTH_CONFIG.RATE_LIMIT.AUTH_ENDPOINTS.max,
		timeWindow: AUTH_CONFIG.RATE_LIMIT.AUTH_ENDPOINTS.timeWindow,
		keyGenerator: (request) => {
			// Rate limit by IP + endpoint combination for auth routes
			const ip = request.ip;
			const endpoint = request.url.split("?")[0]; // Remove query params
			return `auth:${ip}:${endpoint}`;
		},
		errorResponseBuilder: (request, context) => {
			return {
				error: {
					code: "RATE_LIMIT_EXCEEDED",
					message: "Too many authentication attempts. Please try again later.",
					retryAfter: Math.round(context.ttl / 1000)
				},
				timestamp: new Date().toISOString(),
				path: request.url
			};
		},
		// Apply only to auth routes
		allowList: (request) => {
			const authRoutes = ["/login", "/register"];
			return !authRoutes.some((route) => request.url.startsWith(route));
		}
	});

	// Decorate fastify with auth rate limit helpers
	fastify.decorate("authRateLimit", {
		isAuthRoute: (url: string) => {
			const authRoutes = ["/login", "/register"];
			return authRoutes.some((route) => url.startsWith(route));
		}
	});
});

declare module "fastify" {
	interface FastifyInstance {
		authRateLimit: {
			isAuthRoute: (url: string) => boolean;
		};
	}
}
