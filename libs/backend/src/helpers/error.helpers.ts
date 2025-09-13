import { FastifyReply } from "fastify";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";
import { MongoError } from "mongodb";
import {
	ApiError,
	ErrorResponse,
	createValidationError,
	createNotFoundError,
	createUnauthorizedError,
	createForbiddenError,
	createConflictError,
	createInternalError,
	createServiceUnavailableError,
	getStatusForErrorCode
} from "types";

function generateCorrelationId(): string {
	return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function formatErrorResponse(error: ApiError, path?: string): ErrorResponse {
	return {
		error,
		timestamp: new Date().toISOString(),
		path
	};
}

function handleZodError(zodError: ZodError): ApiError {
	const fields: Record<string, string> = {};

	zodError.issues.forEach((err) => {
		const path = err.path.join(".");
		fields[path] = err.message;
	});

	return createValidationError("Validation failed", fields);
}

function handleMongooseValidationError(
	mongooseError: MongooseError.ValidationError
): ApiError {
	const fields: Record<string, string> = {};

	Object.entries(mongooseError.errors).forEach(([field, error]) => {
		fields[field] = error.message;
	});

	return createValidationError("Database validation failed", fields);
}

function handleMongoError(mongoError: MongoError): ApiError {
	if (mongoError.code === 11000) {
		const duplicateField = extractDuplicateField(mongoError.message);
		return createConflictError(
			`${duplicateField} already exists`,
			"A record with this value already exists"
		);
	}

	return createInternalError(
		"Database operation failed",
		generateCorrelationId()
	);
}

function extractDuplicateField(message: string): string {
	const match = message.match(/index: (\w+)_/);
	return match ? match[1] : "field";
}

export function sendErrorResponse(
	reply: FastifyReply,
	error: ApiError,
	path?: string
): void {
	const response = formatErrorResponse(error, path);
	const statusCode = getStatusForErrorCode(error.code);
	reply.status(statusCode).send(response);
}

export function handleAndSendError(
	reply: FastifyReply,
	error: unknown,
	path?: string
): void {
	let apiError: ApiError;

	if (error instanceof ZodError) {
		apiError = handleZodError(error);
	} else if (error instanceof MongooseError.ValidationError) {
		apiError = handleMongooseValidationError(error);
	} else if (error instanceof MongoError) {
		apiError = handleMongoError(error);
	} else if (error instanceof Error) {
		console.error("Unhandled error:", error);
		apiError = createInternalError(
			"An unexpected error occurred",
			generateCorrelationId()
		);
	} else {
		console.error("Unknown error type:", error);
		apiError = createInternalError(
			"An unexpected error occurred",
			generateCorrelationId()
		);
	}

	sendErrorResponse(reply, apiError, path);
}

export function sendValidationError(
	reply: FastifyReply,
	message: string,
	fields?: Record<string, string>,
	path?: string
): void {
	sendErrorResponse(reply, createValidationError(message, fields), path);
}

export function formatZodIssues(error: ZodError): Record<string, string> {
	return Object.fromEntries(
		error.issues.map((err) => [err.path.join("."), err.message])
	);
}

export function sendNotFoundError(
	reply: FastifyReply,
	message: string,
	resource?: string,
	path?: string
): void {
	sendErrorResponse(reply, createNotFoundError(message, resource), path);
}

export function sendUnauthorizedError(
	reply: FastifyReply,
	message?: string,
	path?: string
): void {
	sendErrorResponse(reply, createUnauthorizedError(message), path);
}

export function sendForbiddenError(
	reply: FastifyReply,
	message?: string,
	path?: string
): void {
	sendErrorResponse(reply, createForbiddenError(message), path);
}

export function sendConflictError(
	reply: FastifyReply,
	message: string,
	details?: string,
	path?: string
): void {
	sendErrorResponse(reply, createConflictError(message, details), path);
}

export function sendInternalError(
	reply: FastifyReply,
	message?: string,
	path?: string
): void {
	const correlationId = generateCorrelationId();
	console.error(`Internal error [${correlationId}]:`, message);
	sendErrorResponse(reply, createInternalError(message, correlationId), path);
}

export function sendServiceUnavailableError(
	reply: FastifyReply,
	message: string,
	service?: string,
	path?: string
): void {
	sendErrorResponse(
		reply,
		createServiceUnavailableError(message, service),
		path
	);
}
