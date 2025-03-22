import { httpResponseCodes } from "types";
import { AppError } from "./app-error.js";

export class ServiceUnavailableError extends AppError {
	constructor(message: string = "Unable to reach service") {
		super(message, httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE);
	}
}
