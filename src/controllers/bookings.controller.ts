import type { Request, Response } from "express";
import * as bookingService from "../services/booking.service.ts";

import { StatusCodes } from "http-status-codes";

const createBooking = async (req: Request, res: Response) => {
	const booking = await bookingService.createBooking(req.body);

	res.status(StatusCodes.CREATED).json({
		message: "A new booking was created successfully",
		data: booking,
		success: true,
	});
};

const finalizeBooking = async (req: Request, res: Response) => {
	await bookingService.finalizeBooking(req.params.idempotencyKey as string);

	res.status(StatusCodes.OK).json({
		message: "Finalized the booking successfully",
		data: null,
		success: true,
	});
};

const confirmBookingStatus = async (req: Request, res: Response) => {
	await bookingService.confirmBookingStatus(Number(req.params.id));

	res.status(StatusCodes.OK).json({
		message: "Confirmed the booking successfully",
		data: null,
		success: true,
	});
};

const cancelBookingStatus = async (req: Request, res: Response) => {
	await bookingService.cancelBookingStatus(Number(req.params.id));

	res.status(StatusCodes.OK).json({
		message: "Cancelled the booking successfully",
		data: null,
		success: true,
	});
};

const getAllBookings = async (req: Request, res: Response) => {
	const bookings = await bookingService.getAllBookings();

	res.status(StatusCodes.OK).json({
		message: "Fetched all the bookings successfully",
		data: bookings,
		success: true,
	});
};

const getBookingById = async (req: Request, res: Response) => {
	const booking = await bookingService.getBookingById(Number(req.params.id));

	res.status(StatusCodes.OK).json({
		message: "Fetched the booking successfully",
		data: booking,
		success: true,
	});
};

const removeBookingById = async (req: Request, res: Response) => {
	await bookingService.removeBookingById(Number(req.params.id));

	res.status(StatusCodes.OK).json({
		message: "Removed the booking successfully",
		data: null,
		success: true,
	});
};

const updateBooking = async (req: Request, res: Response) => {
	await bookingService.updateBooking(Number(req.params.id), req.body);

	res.status(StatusCodes.OK).json({
		message: "Updated the booking successfully",
		data: null,
		success: true,
	});
};

export {
	createBooking,
	finalizeBooking,
	confirmBookingStatus,
	cancelBookingStatus,
	getAllBookings,
	getBookingById,
	removeBookingById,
	updateBooking,
};
