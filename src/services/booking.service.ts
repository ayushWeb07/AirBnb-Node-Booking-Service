import type { CreateBookingDto, UpdateBookingDto } from "../dtos/booking.dto.ts"
import * as bookingRepository from "../repositories/booking.repository.ts";

const createBooking = async (bookingData: CreateBookingDto) => {
    const booking = await bookingRepository.createBooking(bookingData);
    return booking;
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

const updateBooking = async (id: number, bookingData: UpdateBookingDto) => {
    await bookingRepository.updateBooking(id, bookingData);
};

export { createBooking, getAllBookings, getBookingById, removeBookingById, updateBooking };