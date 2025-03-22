import { FastifyReply } from "fastify";
import { ErrorResponse, httpResponseCodes } from "types";
import { AppError } from "./app-error.js";
import { ValidationError } from "./validation-error.js";

export function handleError(error: unknown, reply: FastifyReply) {
	const errorResponse: ErrorResponse = {
		error: "Internal Server Error",
		message: "Something went wrong!"
	};

	if (error instanceof AppError) {
		errorResponse.error = error.name;
		errorResponse.message = error.message;

		if (error instanceof ValidationError) {
			errorResponse.details = error.details;
		}

		return reply.status(error.statusCode).send(errorResponse);
	}

	return reply.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(errorResponse);
}
