import { FastifyInstance, FastifyReply } from "fastify";
import { AuthenticatedInfo, httpResponseCodes } from "types";
import { AUTH_CONFIG } from "../config/auth.config.js";

/**
 * Generate JWT token with centralized configuration
 */
export function generateAuthToken(
	fastify: FastifyInstance,
	userInfo: AuthenticatedInfo
): string {
	return fastify.jwt.sign(userInfo, {
		expiresIn: AUTH_CONFIG.JWT.EXPIRY
	});
}

/**
 * Set authentication cookie with centralized configuration
 */
export function setAuthCookie(
	reply: FastifyReply,
	token: string
): FastifyReply {
	return reply.setCookie(
		AUTH_CONFIG.COOKIE.NAME,
		token,
		AUTH_CONFIG.COOKIE.OPTIONS
	);
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(reply: FastifyReply): FastifyReply {
	return reply.clearCookie(AUTH_CONFIG.COOKIE.NAME, {
		path: AUTH_CONFIG.COOKIE.OPTIONS.path,
		domain: AUTH_CONFIG.COOKIE.OPTIONS.domain
	});
}

/**
 * Create complete authentication response (token + cookie)
 */
export function createAuthResponse(
	fastify: FastifyInstance,
	reply: FastifyReply,
	userInfo: AuthenticatedInfo,
	message: string = "Authentication successful"
): FastifyReply {
	const token = generateAuthToken(fastify, userInfo);
	return setAuthCookie(reply, token)
		.status(httpResponseCodes.SUCCESSFUL.OK)
		.send({ message });
}
