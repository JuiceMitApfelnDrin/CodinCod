import { httpResponseCodes } from "types";
import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
	constructor(message: string = "Resource not found") {
		super(message, httpResponseCodes.CLIENT_ERROR.NOT_FOUND);
	}
}
