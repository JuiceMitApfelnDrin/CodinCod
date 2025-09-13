import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema } from "zod";
import { Result } from "types";
import { handleAndSendError } from "./error.helpers.js";

type RouteHandler<T> = (
	data: T,
	request: FastifyRequest,
	reply: FastifyReply
) => Promise<void>;

/**
 * Helper function that handles common route patterns:
 * 1. Parse and validate request body
 * 2. Execute business logic
 * 3. Handle errors consistently
 */
export function createValidatedHandler<T>(
	schema: ZodSchema<T>,
	handler: RouteHandler<T>
) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const parseResult = schema.safeParse(request.body);

		if (!parseResult.success) {
			return handleAndSendError(reply, parseResult.error, request.url);
		}

		try {
			await handler(parseResult.data, request, reply);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	};
}

/**
 * Helper for routes that don't need body validation
 */
export function createHandler(
	handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			await handler(request, reply);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	};
}

/**
 * Helper for async operations that return Result<T, E>
 */
export async function handleResult<T>(
	result: Promise<Result<T, Error>>,
	reply: FastifyReply,
	path?: string
): Promise<T | void> {
	try {
		const res = await result;
		if (!res.success) {
			return handleAndSendError(reply, res.error, path);
		}
		return res.data;
	} catch (error) {
		return handleAndSendError(reply, error, path);
	}
}
