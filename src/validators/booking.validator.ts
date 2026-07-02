import z from "zod";

const createBookingSchema = z.object({
	userId: z.number().nonnegative(),
	hotelId: z.number().nonnegative(),
	roomTypeId: z.number().nonnegative(),
	bookingAmount: z.number().gt(0),
	totalGuests: z.number().gt(0),
	totalRooms: z.number().gt(0),
	checkInDate: z.iso.datetime(),
	checkOutDate: z.iso.datetime(),
});

const getBookingByIdSchema = z.object({
	id: z.coerce.number().nonnegative(),
});

const removeBookingByIdSchema = z.object({
	id: z.coerce.number().nonnegative(),
});

const updateBookingBodySchema = z.object({
	userId: z.number().nonnegative().optional(),
	hotelId: z.number().nonnegative().optional(),
	roomTypeId: z.number().nonnegative().optional(),
	bookingAmount: z.number().gt(0).optional(),
	totalGuests: z.number().gt(0).optional(),
	totalRooms: z.number().gt(0).optional(),
});

const updateBookingUrlParamsSchema = z.object({
	id: z.coerce.number().nonnegative(),
});

const confirmBookingStatusSchema = z.object({
	id: z.coerce.number().nonnegative(),
});

const cancelBookingStatusSchema = z.object({
	id: z.coerce.number().nonnegative(),
});

const finalizeBookingSchema = z.object({
	idempotencyKey: z.uuidv4(),
});

export {
	createBookingSchema,
	finalizeBookingSchema,
	getBookingByIdSchema,
	removeBookingByIdSchema,
	updateBookingBodySchema,
	updateBookingUrlParamsSchema,
	confirmBookingStatusSchema,
	cancelBookingStatusSchema,
};
