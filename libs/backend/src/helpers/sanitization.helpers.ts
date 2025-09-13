import { FastifyRequest, FastifyReply } from "fastify";

/**
 * Simple input sanitization helpers
 */

function sanitizeString(input: string): string {
	// Remove potential XSS characters and normalize whitespace
	return input
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/on\w+\s*=/gi, "")
		.trim();
}

function sanitizeObject<T>(obj: T): T {
	if (typeof obj === "string") {
		return sanitizeString(obj) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map(sanitizeObject) as T;
	}

	if (obj && typeof obj === "object") {
		const sanitized = {} as T;
		for (const key in obj) {
			if (Object.hasOwn(obj, key)) {
				(sanitized as Record<string, unknown>)[key] = sanitizeObject(obj[key]);
			}
		}
		return sanitized;
	}

	return obj;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeInput(
	request: FastifyRequest,
	reply: FastifyReply,
	done: Function
) {
	if (request.body && typeof request.body === "object") {
		request.body = sanitizeObject(request.body);
	}

	if (request.query && typeof request.query === "object") {
		request.query = sanitizeObject(request.query);
	}

	done();
}

/**
 * Manual sanitization function for specific use cases
 */
export function sanitize<T>(input: T): T {
	return sanitizeObject(input);
}
