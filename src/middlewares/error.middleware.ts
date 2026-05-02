import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/app.error.ts";
import { Sentry } from "../config/sentry.config.ts";

const errorHandler = (
	error: AppError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const errorObj = {
		success: false,
		message: error.message ?? "Internal Server Error",
		name: error.name,
		stackTrace: error?.stack ?? "No stack trace present",
	};

	// send the sentry message
	Sentry.captureException(error, {
		extra: errorObj,
	});

	// send out the response
	res.status(error.statusCode ?? 500).json(errorObj);
};

export { errorHandler };
