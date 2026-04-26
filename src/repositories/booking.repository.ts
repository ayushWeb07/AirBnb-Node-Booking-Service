import { logger } from "../config/logger.config.ts";
import type { CreateBookingDto, UpdateBookingDto } from "../dtos/booking.dto.ts"
import { InternalServerError, NotFoundError } from "../utils/errors/app.error.ts";
import { db } from "../db/index.ts";
import { bookings } from "../db/schemas/bookings.ts";
import { eq } from "drizzle-orm"

// create a booking entry
const create = async (bookingData: CreateBookingDto) => {
    try {
        const [newBooking] = await db
            .insert(bookings)
            .values(bookingData)
            .$returningId()

        logger.info("Bookings: create -> success", {
            id: newBooking,
        });

        return newBooking;
    } catch (error) {
        logger.error("Bookings: create -> failure", error);

        throw new InternalServerError(
            "Something went wrong while creating a new booking",
            error instanceof Error ? error.stack : undefined,
        );
    }
};

// get all booking entries
const getAll = async () => {
    try {
        const allBookings = await db
            .select()
            .from(bookings);

        logger.info("Bookings: getAll -> success", {
            count: allBookings.length,
        });

        return allBookings;
    } catch (error) {
        logger.error("Bookings: getAll -> failure", error);

        throw new InternalServerError(
            "Something went wrong while getting all the bookings",
            error instanceof Error ? error.stack : undefined,
        );
    }
};

// get a single booking entry by id
const getById = async (id: number) => {
    try {
        const booking = await db
            .select()
            .from(bookings)
            .where(
                eq(bookings.id, id)
            );

        if (!booking.length) {
            logger.error("Bookings: getById -> failure", {
                id,
                error: "Booking not found",
            });

            throw new NotFoundError("Booking not found");
        } else {
            logger.info("Bookings: getById -> success", {
                id: booking[0],
            });

            return booking[0];
        }
    } catch (error) {

        if (error instanceof NotFoundError) {
            throw error;
        }

        else {
            logger.error("Bookings: getById -> failure", error);

            throw new InternalServerError(
                "Something went wrong while getting the booking by id",
                error instanceof Error ? error.stack : undefined,
            );
        }
    }
};

// remove booking entry by id
const remove = async (id: number) => {
    try {
        const deletedBooking = await db
            .delete(bookings)
            .where(
                eq(
                    bookings.id, id
                )
            );

        if (!deletedBooking[0].affectedRows) {
            logger.error("Bookings: remove -> failure", {
                id,
                error: "Booking not found",
            });

            throw new NotFoundError("Booking not found");
        }

        logger.info("Bookings: remove -> success", {
            id,
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        else {
            logger.error("Bookings: remove -> failure", error);

            throw new InternalServerError(
                "Something went wrong while removing the booking",
                error instanceof Error ? error.stack : undefined,
            );
        }
    }
};

// update a single booking entry
const update = async (id: number, bookingData: UpdateBookingDto) => {
    try {

        const updatedBooking= await db
            .update(bookings)
            .set(bookingData)
            .where(
                eq(bookings.id, id)
            );

        if (!updatedBooking[0].affectedRows) {
            logger.error("Bookings: update -> failure", {
                id,
                error: "Booking not found",
            });

            throw new NotFoundError("Booking not found");
        }

        logger.info("Bookings: update -> success", {
            id,
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        else {
            logger.error("Bookings: update -> failure", error);

            throw new InternalServerError(
                "Something went wrong while updating the booking",
                error instanceof Error ? error.stack : undefined,
            );
        }
    }
};

export { create, getAll, getById, remove, update };
