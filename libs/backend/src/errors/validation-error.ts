import { httpResponseCodes } from "types";
import { AppError } from "./app-error.js";

export class ValidationError extends AppError {
	constructor(
		public readonly details: any,
		message: string = "Validation failed"
	) {
		super(message, httpResponseCodes.CLIENT_ERROR.BAD_REQUEST);
	}
}
