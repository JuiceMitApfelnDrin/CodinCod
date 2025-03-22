export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode: number, isOperational: boolean = true) {
		super(message);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}

		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
	}
}
