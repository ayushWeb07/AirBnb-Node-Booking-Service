import { logger } from "../config/logger.config.ts";
import type {
	CreateBookingDto,
	UpdateBookingDto,
} from "../dtos/booking.dto.ts";
import {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	NotFoundError,
} from "../utils/errors/app.error.ts";
import { db } from "../db/index.ts";
import { bookings } from "../db/schemas/bookings.ts";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { redlock } from "../config/redlock.config.ts";
import { serverConfig } from "../config/index.ts";
import { ResourceLockedError, ExecutionError } from "redlock";
import { StatusCodes } from "http-status-codes";

// create a booking
const createBooking = async (bookingData: CreateBookingDto) => {
	try {
		// check if the user even exists
		const apiGatewayUrl =
			serverConfig.API_GATEWAY_BASE_URL + "/users/" + bookingData.userId;

		let response = await fetch(apiGatewayUrl);

		if (response.status === StatusCodes.NOT_FOUND) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				userId: bookingData.userId,
				error: "User not found",
			});

			throw new NotFoundError("User not found");
		} else if (response.status !== StatusCodes.OK) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				userId: bookingData.userId,
				error: "Something went wrong while checking if the user exists",
			});

			throw new InternalServerError(
				"Something went wrong while checking if the user exists",
			);
		}

		// check if the hotel even exists
		const hotelServiceUrl =
			serverConfig.HOTEL_SERVICE_BASE_URL + "/hotels/" + bookingData.hotelId;

		response = await fetch(hotelServiceUrl);

		if (response.status === StatusCodes.NOT_FOUND) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				hotelId: bookingData.hotelId,
				error: "Hotel not found",
			});

			throw new NotFoundError("Hotel not found");
		} else if (response.status !== StatusCodes.OK) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				hotelId: bookingData.hotelId,
				error: "Something went wrong while checking if the hotel exists",
			});

			throw new InternalServerError(
				"Something went wrong while checking if the hotel exists",
			);
		}

		// check if the room type even exists
		const roomTypesUrl =
			serverConfig.HOTEL_SERVICE_BASE_URL +
			"/room-types/" +
			bookingData.roomTypeId;

		response = await fetch(roomTypesUrl);
		const roomTypeRes = await response.json();

		if (response.status === StatusCodes.NOT_FOUND) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				roomTypeId: bookingData.roomTypeId,
				error: "Room type not found",
			});

			throw new NotFoundError("Room type not found");
		} else if (response.status !== StatusCodes.OK) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				roomTypeId: bookingData.roomTypeId,
				error: "Something went wrong while checking if the room type exists",
			});

			throw new InternalServerError(
				"Something went wrong while checking if the room type exists",
			);
		}

		// check if the hotelId mentioned in the roomType, matches the user sent hotelId
		if (roomTypeRes.data.hotelId !== bookingData.hotelId) {
			logger.error("Bookings: createBooking endpoint -> failure", {
				error: "Invalid room type has been provided for the specific hotel",
			});

			throw new BadRequestError(
				"Invalid room type has been provided for the specific hotel",
			);
		}

		// generate an idempotency key
		const idempotencyKey = uuidv4();

		// create and acquire the lock
		const lock = `lock:hotels:${bookingData.hotelId}`;
		await redlock.acquire([lock], serverConfig.REDIS_LOCK_TTL);

		const [newBooking] = await db
			.insert(bookings)
			.values({
				...bookingData,
				idempotencyKey,
			})
			.$returningId();

		logger.info("Bookings: createBooking endpoint -> success", {
			...newBooking,
			idempotencyKey,
		});

		return {
			...newBooking,
			idempotencyKey,
		};
	} catch (error) {
		// the hotel resource is already locked
		if (
			error instanceof ResourceLockedError ||
			error instanceof ExecutionError
		) {
			logger.error("Bookings: createBooking endpoint -> failure", error);

			throw new ForbiddenError(
				"The hotel is currently being booked by someone else, please try again later.",
				error.stack,
			);
		} else if (
			error instanceof NotFoundError ||
			error instanceof InternalServerError ||
			error instanceof BadRequestError
		) {
			throw error;
		} else {
			logger.error("Bookings: createBooking endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while creating a new booking",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

// finalize the booking
const finalizeBooking = async (idempotencyKey: string) => {
	try {
		// find the booking with that idempotencyKey
		const [booking] = await db
			.select()
			.from(bookings)
			.where(eq(bookings.idempotencyKey, idempotencyKey));

		if (!booking) {
			logger.error("Bookings: finalizeBooking endpoint -> failure", {
				idempotencyKey,
				error: "No booking associated with such idempotencyKey",
			});

			throw new NotFoundError("No booking associated with such idempotencyKey");
		} else {
			// check the booking status and throw error if its either confirmed / canceled
			if (booking.status !== "pending") {
				logger.info("Bookings: finalizeBooking endpoint -> failure", {
					id: booking.id,
					idempotencyKey,
					error: `Booking with such idempotencyKey is already ${booking.status}`,
				});

				throw new BadRequestError(
					`Booking with such idempotencyKey is already ${booking.status}`,
				);
			}

			// finalize booking i.e., mark it as completed
			else {
				await confirmBookingStatus(booking.id);

				logger.info("Bookings: finalizeBooking endpoint -> success", {
					id: booking.id,
				});
			}
		}
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof BadRequestError) {
			throw error;
		} else {
			logger.error("Bookings: finalizeBooking endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while finalizing the booking",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

// confirm booking status
const confirmBookingStatus = async (id: number) => {
	try {
		const [result] = await db
			.update(bookings)
			.set({
				status: "confirmed",
			})
			.where(eq(bookings.id, id));

		if (result.affectedRows === 0) {
			logger.error("Bookings: confirmBookingStatus endpoint -> failure", {
				id,
				error: "Booking not found",
			});

			throw new NotFoundError("Booking not found");
		}

		logger.info("Bookings: confirmBookingStatus endpoint -> success", {
			id,
		});
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		} else {
			logger.error("Bookings: confirmBookingStatus endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while confirming the booking",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

// cancel booking status
const cancelBookingStatus = async (id: number) => {
	try {
		const [result] = await db
			.update(bookings)
			.set({
				status: "cancelled",
			})
			.where(eq(bookings.id, id));

		if (result.affectedRows === 0) {
			logger.error("Bookings: cancelBookingStatus endpoint -> failure", {
				id,
				error: "Booking not found",
			});

			throw new NotFoundError("Booking not found");
		}

		logger.info("Bookings: cancelBookingStatus endpoint -> success", {
			id,
		});
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		} else {
			logger.error("Bookings: cancelBookingStatus endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while cancelling the booking",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

// get all booking entries
const getAllBookings = async () => {
	try {
		const allBookings = await db.select().from(bookings);

		logger.info("Bookings: getAllBookings endpoint -> success", {
			count: allBookings.length,
		});

		return allBookings;
	} catch (error) {
		logger.error("Bookings: getAllBookings endpoint -> failure", error);

		throw new InternalServerError(
			"Something went wrong while getting all the bookings",
			error instanceof Error ? error.stack : undefined,
		);
	}
};

// get a single booking entry by id
const getBookingById = async (id: number) => {
	try {
		const [booking] = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, id));

		if (!booking) {
			logger.error("Bookings: getBookingById endpoint -> failure", {
				id,
				error: "Booking not found",
			});

			throw new NotFoundError("Booking not found");
		} else {
			logger.info("Bookings: getBookingById endpoint -> success", booking);

			return booking;
		}
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		} else {
			logger.error("Bookings: getBookingById endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while getting the booking by id",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

// remove booking entry by id
const removeBookingById = async (id: number) => {
	try {
		const [result] = await db.delete(bookings).where(eq(bookings.id, id));

		if (result.affectedRows === 0) {
			logger.error("Bookings: removeBookingById endpoint -> failure", {
				id,
				error: "Booking not found",
			});

			throw new NotFoundError("Booking not found");
		}

		logger.info("Bookings: removeBookingById endpoint -> success", {
			id,
		});
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		} else {
			logger.error("Bookings: removeBookingById endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while removing the booking",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

// update a single booking entry
const updateBooking = async (id: number, bookingData: UpdateBookingDto) => {
	try {
		// check if the user even exists
		if (bookingData.userId) {
			const apiGatewayUrl =
				serverConfig.API_GATEWAY_BASE_URL + "/users/" + bookingData.userId;

			const response = await fetch(apiGatewayUrl);

			if (response.status === StatusCodes.NOT_FOUND) {
				logger.error("Bookings: createBooking endpoint -> failure", {
					userId: bookingData.userId,
					error: "User not found",
				});

				throw new NotFoundError("User not found");
			} else if (response.status !== StatusCodes.OK) {
				logger.error("Bookings: createBooking endpoint -> failure", {
					userId: bookingData.userId,
					error: "Something went wrong while checking if the user exists",
				});

				throw new InternalServerError(
					"Something went wrong while checking if the user exists",
				);
			}
		}

		// check if the hotel even exists
		if (bookingData.hotelId) {
			const hotelServiceUrl =
				serverConfig.HOTEL_SERVICE_BASE_URL + "/hotels/" + bookingData.hotelId;

			const response = await fetch(hotelServiceUrl);

			if (response.status === StatusCodes.NOT_FOUND) {
				logger.error("Bookings: createBooking endpoint -> failure", {
					hotelId: bookingData.hotelId,
					error: "Hotel not found",
				});

				throw new NotFoundError("Hotel not found");
			} else if (response.status !== StatusCodes.OK) {
				logger.error("Bookings: createBooking endpoint -> failure", {
					hotelId: bookingData.hotelId,
					error: "Something went wrong while checking if the hotel exists",
				});

				throw new InternalServerError(
					"Something went wrong while checking if the hotel exists",
				);
			}
		}

		// check if the room type even exists
		if (bookingData.roomTypeId) {
			const roomTypesUrl =
				serverConfig.HOTEL_SERVICE_BASE_URL +
				"/room-types/" +
				bookingData.roomTypeId;

			const response = await fetch(roomTypesUrl);
			const roomTypeRes = await response.json();

			if (response.status === StatusCodes.NOT_FOUND) {
				logger.error("Bookings: updateBooking endpoint -> failure", {
					roomTypeId: bookingData.roomTypeId,
					error: "Room type not found",
				});

				throw new NotFoundError("Room type not found");
			} else if (response.status !== StatusCodes.OK) {
				logger.error("Bookings: updateBooking endpoint -> failure", {
					roomTypeId: bookingData.roomTypeId,
					error: "Something went wrong while checking if the room type exists",
				});

				throw new InternalServerError(
					"Something went wrong while checking if the room type exists",
				);
			}

			// check if the hotelId mentioned in the roomType, matches the user sent hotelId
			if (roomTypeRes.data.hotelId !== bookingData.hotelId) {
				logger.error("Bookings: updateBooking endpoint -> failure", {
					error: "Invalid room type has been provided for the specific hotel",
				});

				throw new BadRequestError(
					"Invalid room type has been provided for the specific hotel",
				);
			}
		}

		const [result] = await db
			.update(bookings)
			.set(bookingData)
			.where(eq(bookings.id, id));

		if (result.affectedRows === 0) {
			logger.error("Bookings: updateBooking endpoint -> failure", {
				id,
				error: "Booking not found",
			});

			throw new NotFoundError("Booking not found");
		}

		logger.info("Bookings: updateBooking endpoint -> success", {
			id,
		});
	} catch (error) {
		if (
			error instanceof NotFoundError ||
			error instanceof BadRequestError ||
			error instanceof InternalServerError
		) {
			throw error;
		} else {
			logger.error("Bookings: updateBooking endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while updating the booking",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
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
