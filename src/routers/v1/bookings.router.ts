import { Router } from "express";
import * as bookingsController from "../../controllers/bookings.controller.ts";

import {
	validateRequestBody,
	validateRequestUrlParams,
} from "../../validators/request.validator.ts";

import * as bookingValidator from "../../validators/booking.validator.ts";

const router = Router();

router.get("/", bookingsController.getAllBookings);
router.get(
	"/:id",
	validateRequestUrlParams(bookingValidator.getBookingByIdSchema),
	bookingsController.getBookingById,
);
router.patch(
	"/confirm/:id",
	validateRequestUrlParams(bookingValidator.confirmBookingStatusSchema),
	bookingsController.confirmBookingStatus,
);
router.patch(
	"/cancel/:id",
	validateRequestUrlParams(bookingValidator.cancelBookingStatusSchema),
	bookingsController.cancelBookingStatus,
);
router.post(
	"/",
	validateRequestBody(bookingValidator.createBookingSchema),
	bookingsController.createBooking,
);
router.patch(
	"/finalize/:idempotencyKey",
	validateRequestUrlParams(bookingValidator.finalizeBookingSchema),
	bookingsController.finalizeBooking,
);
router.delete(
	"/:id",
	validateRequestUrlParams(bookingValidator.removeBookingByIdSchema),
	bookingsController.removeBookingById,
);

export default router;
