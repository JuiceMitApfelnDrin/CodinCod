import { httpResponseCodes } from "types";
import { AppError } from "./app-error.js";

export class PistonError extends AppError {
	constructor(message: string = "Piston error") {
		super(message, httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR);
	}
}
