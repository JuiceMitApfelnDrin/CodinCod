import { httpResponseCodes } from "types";
import { AppError } from "./app-error.js";

export class InternalServerError extends AppError {
	constructor(message: string = "Something went wrong during piston code execution") {
		super(message, httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR);
	}
}
