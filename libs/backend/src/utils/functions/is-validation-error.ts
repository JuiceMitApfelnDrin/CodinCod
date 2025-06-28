import { Error } from "mongoose";

export function isValidationError(
	error: unknown
): error is Error.ValidationError {
	return error instanceof Error.ValidationError;
}
