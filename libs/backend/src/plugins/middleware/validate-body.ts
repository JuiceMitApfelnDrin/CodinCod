import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodSchema } from "zod";
import { httpResponseCodes, type ErrorResponse } from "types";

/**
 * Creates a validation middleware for request body validation using Zod schemas
 *
 * This middleware provides consistent error handling across all routes
 * and ensures type safety at runtime.
 *
 * @param schema - Zod schema to validate the request body against
 * @returns Fastify preHandler hook function
 *
 * @example
 * ```typescript
 * import { validateBody } from '@/plugins/middleware/validate-body.js';
 * import { registerSchema } from 'types';
 *
 * fastify.post(
 *   '/',
 *   { preHandler: validateBody(registerSchema) },
 *   async (request, reply) => {
 *     // request.body is now typed and validated
 *     const { email, password, username } = request.body;
 *     // ...
 *   }
 * );
 * ```
 */
export function validateBody<T extends ZodSchema>(schema: T) {
	return async (
		request: FastifyRequest,
		reply: FastifyReply
	): Promise<void> => {
		try {
			// Parse and validate the request body
			request.body = schema.parse(request.body);
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Format Zod validation errors for client
				const formattedErrors = error.issues.map((issue) => ({
					path: issue.path.join("."),
					message: issue.message,
					code: issue.code
				}));

				const errorResponse: ErrorResponse = {
					error: "Validation Error",
					message: "Request validation failed",
					details: formattedErrors
				};

				reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send(errorResponse);
				return;
			}

			// Unexpected error during validation
			request.log.error({ err: error }, "Unexpected validation error");
			const errorResponse: ErrorResponse = {
				error: "Internal Server Error",
				message: "An unexpected error occurred during validation"
			};

			reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send(errorResponse);
		}
	};
}

/**
 * Creates a validation middleware for query parameters using Zod schemas
 *
 * @param schema - Zod schema to validate the query parameters against
 * @returns Fastify preHandler hook function
 *
 * @example
 * ```typescript
 * import { validateQuery } from '@/plugins/middleware/validate-body.js';
 * import { paginatedQuerySchema } from 'types';
 *
 * fastify.get(
 *   '/',
 *   { preHandler: validateQuery(paginatedQuerySchema) },
 *   async (request, reply) => {
 *     const { page, pageSize } = request.query;
 *     // ...
 *   }
 * );
 * ```
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
	return async (
		request: FastifyRequest,
		reply: FastifyReply
	): Promise<void> => {
		try {
			request.query = schema.parse(request.query);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = error.issues.map((issue) => ({
					path: issue.path.join("."),
					message: issue.message,
					code: issue.code
				}));

				const errorResponse: ErrorResponse = {
					error: "Validation Error",
					message: "Query parameter validation failed",
					details: formattedErrors
				};

				reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send(errorResponse);
				return;
			}

			request.log.error({ err: error }, "Unexpected query validation error");
			const errorResponse: ErrorResponse = {
				error: "Internal Server Error",
				message: "An unexpected error occurred during query validation"
			};

			reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send(errorResponse);
		}
	};
}

/**
 * Creates a validation middleware for route parameters using Zod schemas
 *
 * @param schema - Zod schema to validate the route params against
 * @returns Fastify preHandler hook function
 *
 * @example
 * ```typescript
 * import { validateParams } from '@/plugins/middleware/validate-body.js';
 * import { z } from 'zod';
 *
 * const paramsSchema = z.object({
 *   id: z.string().min(1)
 * });
 *
 * fastify.get(
 *   '/:id',
 *   { preHandler: validateParams(paramsSchema) },
 *   async (request, reply) => {
 *     const { id } = request.params;
 *     // ...
 *   }
 * );
 * ```
 */
export function validateParams<T extends ZodSchema>(schema: T) {
	return async (
		request: FastifyRequest,
		reply: FastifyReply
	): Promise<void> => {
		try {
			request.params = schema.parse(request.params);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = error.issues.map((issue) => ({
					path: issue.path.join("."),
					message: issue.message,
					code: issue.code
				}));

				const errorResponse: ErrorResponse = {
					error: "Validation Error",
					message: "Route parameter validation failed",
					details: formattedErrors
				};

				reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send(errorResponse);
				return;
			}

			request.log.error({ err: error }, "Unexpected params validation error");
			const errorResponse: ErrorResponse = {
				error: "Internal Server Error",
				message: "An unexpected error occurred during parameter validation"
			};

			reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send(errorResponse);
		}
	};
}
