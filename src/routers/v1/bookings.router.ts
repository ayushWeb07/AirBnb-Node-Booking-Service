import { Router } from "express";
import * as bookingsController from "../../controllers/bookings.controller.ts";

import {
    validateRequestBody,
    validateRequestUrlParams,
} from "../../validators/request.validator.ts";

import * as bookingValidator from "../../validators/booking.validator.ts";

const router = Router();

router.get("/", bookingsController.getAllBookings);
router.get("/:id", validateRequestUrlParams(bookingValidator.getByIdSchema), bookingsController.getBookingById);
router.post("/", validateRequestBody(bookingValidator.createSchema), bookingsController.createBooking);
router.delete("/:id", validateRequestUrlParams(bookingValidator.removeSchema), bookingsController.removeBookingById);
router.patch("/:id", validateRequestUrlParams(bookingValidator.updateUrlParamsSchema), validateRequestBody(bookingValidator.updateBodySchema), bookingsController.updateBooking);

export default router;
