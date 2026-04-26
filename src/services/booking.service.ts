import type { CreateBookingDto, UpdateBookingDto } from "../dtos/booking.dto.ts"
import * as bookingRepository from "../repositories/booking.repository.ts";

const create = async (bookingData: CreateBookingDto) => {
    const booking = await bookingRepository.create(bookingData);
    return booking;
};

const getAll = async () => {
    const bookings = await bookingRepository.getAll();
    return bookings;
};

const getById = async (id: number) => {
    const booking = await bookingRepository.getById(id);
    return booking;
};

const remove = async (id: number) => {
    await bookingRepository.remove(id);
};

const update = async (id: number, bookingData: UpdateBookingDto) => {
    await bookingRepository.update(id, bookingData);
};

export { create, getAll, getById, remove, update };