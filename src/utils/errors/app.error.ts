import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
	statusCode: number;
	name: string;

	constructor(statusCode: number, message: string, name: string) {
		super(message);
		this.statusCode = statusCode;
		this.name = name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class InternalServerError extends AppError {
	constructor(message: string, stack?: string) {
		super(StatusCodes.INTERNAL_SERVER_ERROR, message, "InternalServerError");

		if (stack) {
			this.stack = stack;
		}
	}
}

export class BadRequestError extends AppError {
	constructor(message: string, stack?: string) {
		super(StatusCodes.BAD_REQUEST, message, "BadRequestError");

		if (stack) {
			this.stack = stack;
		}
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string, stack?: string) {
		super(StatusCodes.UNAUTHORIZED, message, "UnauthorizedError");

		if (stack) {
			this.stack = stack;
		}
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string, stack?: string) {
		super(StatusCodes.FORBIDDEN, message, "ForbiddenError");

		if (stack) {
			this.stack = stack;
		}
	}
}

export class NotFoundError extends AppError {
	constructor(message: string, stack?: string) {
		super(StatusCodes.NOT_FOUND, message, "NotFoundError");

		if (stack) {
			this.stack = stack;
		}
	}
}
