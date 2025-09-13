import { z } from "zod";

export type Result<T, E> =
	| { success: true; data: T }
	| { success: false; error: E };

export function Ok<T>(data: T): Result<T, never> {
	return { success: true, data };
}

export function Err<E>(error: E): Result<never, E> {
	return { success: false, error };
}

export const validationErrorSchema = z.object({
	code: z.literal("VALIDATION_ERROR"),
	message: z.string(),
	fields: z.record(z.string(), z.string()).optional(),
});

export const notFoundErrorSchema = z.object({
	code: z.literal("NOT_FOUND"),
	message: z.string(),
	resource: z.string().optional(),
});

export const unauthorizedErrorSchema = z.object({
	code: z.literal("UNAUTHORIZED"),
	message: z.string(),
});

export const forbiddenErrorSchema = z.object({
	code: z.literal("FORBIDDEN"),
	message: z.string(),
});

export const conflictErrorSchema = z.object({
	code: z.literal("CONFLICT"),
	message: z.string(),
	details: z.string().optional(),
});

export const internalErrorSchema = z.object({
	code: z.literal("INTERNAL_ERROR"),
	message: z.string(),
	correlationId: z.string().optional(),
});

export const serviceUnavailableErrorSchema = z.object({
	code: z.literal("SERVICE_UNAVAILABLE"),
	message: z.string(),
	service: z.string().optional(),
});

export const rateLimitErrorSchema = z.object({
	code: z.literal("RATE_LIMIT_EXCEEDED"),
	message: z.string(),
	retryAfter: z.number().optional(),
});

export const apiErrorSchema = z.discriminatedUnion("code", [
	validationErrorSchema,
	notFoundErrorSchema,
	unauthorizedErrorSchema,
	forbiddenErrorSchema,
	conflictErrorSchema,
	internalErrorSchema,
	serviceUnavailableErrorSchema,
	rateLimitErrorSchema,
]);

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type NotFoundError = z.infer<typeof notFoundErrorSchema>;
export type UnauthorizedError = z.infer<typeof unauthorizedErrorSchema>;
export type ForbiddenError = z.infer<typeof forbiddenErrorSchema>;
export type ConflictError = z.infer<typeof conflictErrorSchema>;
export type InternalError = z.infer<typeof internalErrorSchema>;
export type ServiceUnavailableError = z.infer<
	typeof serviceUnavailableErrorSchema
>;
export type RateLimitError = z.infer<typeof rateLimitErrorSchema>;

export const errorResponseSchema = z.object({
	error: apiErrorSchema,
	timestamp: z.string(),
	path: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export function createValidationError(
	message: string,
	fields?: Record<string, string>,
): ValidationError {
	return { code: "VALIDATION_ERROR", message, fields };
}

export function createNotFoundError(
	message: string,
	resource?: string,
): NotFoundError {
	return { code: "NOT_FOUND", message, resource };
}

export function createUnauthorizedError(
	message: string = "Unauthorized access",
): UnauthorizedError {
	return { code: "UNAUTHORIZED", message };
}

export function createForbiddenError(
	message: string = "Forbidden",
): ForbiddenError {
	return { code: "FORBIDDEN", message };
}

export function createConflictError(
	message: string,
	details?: string,
): ConflictError {
	return { code: "CONFLICT", message, details };
}

export function createInternalError(
	message: string = "Internal server error",
	correlationId?: string,
): InternalError {
	return { code: "INTERNAL_ERROR", message, correlationId };
}

export function createServiceUnavailableError(
	message: string,
	service?: string,
): ServiceUnavailableError {
	return { code: "SERVICE_UNAVAILABLE", message, service };
}

export function createRateLimitError(
	message: string = "Rate limit exceeded",
	retryAfter?: number,
): RateLimitError {
	return { code: "RATE_LIMIT_EXCEEDED", message, retryAfter };
}

const ERROR_STATUS_MAP = {
	VALIDATION_ERROR: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	RATE_LIMIT_EXCEEDED: 429,
	INTERNAL_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
} as const;

export function getStatusForErrorCode(code: ApiError["code"]): number {
	return ERROR_STATUS_MAP[code];
}

export function isApiError(error: unknown): error is ApiError {
	return apiErrorSchema.safeParse(error).success;
}

export function isValidationError(error: unknown): error is ValidationError {
	return validationErrorSchema.safeParse(error).success;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
	return notFoundErrorSchema.safeParse(error).success;
}

export function isUnauthorizedError(
	error: unknown,
): error is UnauthorizedError {
	return unauthorizedErrorSchema.safeParse(error).success;
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
	return forbiddenErrorSchema.safeParse(error).success;
}

export function isConflictError(error: unknown): error is ConflictError {
	return conflictErrorSchema.safeParse(error).success;
}

export function isInternalError(error: unknown): error is InternalError {
	return internalErrorSchema.safeParse(error).success;
}

export function isServiceUnavailableError(
	error: unknown,
): error is ServiceUnavailableError {
	return serviceUnavailableErrorSchema.safeParse(error).success;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
	return rateLimitErrorSchema.safeParse(error).success;
}
