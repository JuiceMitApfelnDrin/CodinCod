import { httpResponseCodes } from "types";
import { AppError } from "./app-error.js";

export class UnauthorizedError extends AppError {
	constructor(message: string = "Not authenticated") {
		super(message, httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED);
	}
}
