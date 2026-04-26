import { Router } from "express";
import * as bookingsController from "../../controllers/bookings.controller.ts";

import {
    validateRequestBody,
    validateRequestUrlParams,
} from "../../validators/request.validator.ts";

import * as bookingValidator from "../../validators/booking.validator.ts";

const router = Router();

router.get("/", bookingsController.getAll);
router.get("/:id", validateRequestUrlParams(bookingValidator.getByIdSchema), bookingsController.getById);
router.post("/", validateRequestBody(bookingValidator.createSchema), bookingsController.create);
router.delete("/:id", validateRequestUrlParams(bookingValidator.removeSchema), bookingsController.remove);
router.patch("/:id", validateRequestUrlParams(bookingValidator.updateUrlParamsSchema), validateRequestBody(bookingValidator.updateBodySchema), bookingsController.update);

export default router;
