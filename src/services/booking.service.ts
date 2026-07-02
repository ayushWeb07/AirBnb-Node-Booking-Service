import type {
	CreateBookingDto,
} from "../dtos/booking.dto.ts";
import * as bookingRepository from "../repositories/booking.repository.ts";

const createBooking = async (bookingData: CreateBookingDto) => {
	const booking = await bookingRepository.createBooking(bookingData);
	return booking;
};

const finalizeBooking = async (idempotencyKey: string) => {
	await bookingRepository.finalizeBooking(idempotencyKey);
};

const confirmBookingStatus = async (id: number) => {
	await bookingRepository.confirmBookingStatus(id);
};

const cancelBookingStatus = async (id: number) => {
	await bookingRepository.cancelBookingStatus(id);
};

const getAllBookings = async () => {
	const bookings = await bookingRepository.getAllBookings();
	return bookings;
};

const getBookingById = async (id: number) => {
	const booking = await bookingRepository.getBookingById(id);
	return booking;
};

const removeBookingById = async (id: number) => {
	await bookingRepository.removeBookingById(id);
};

export {
	createBooking,
	finalizeBooking,
	confirmBookingStatus,
	cancelBookingStatus,
	getAllBookings,
	getBookingById,
	removeBookingById,
};
