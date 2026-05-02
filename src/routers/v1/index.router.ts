import { Router } from "express";
import bookingsRouter from "./bookings.router.ts";

const router = Router();

// setup all app routes
router.use("/bookings", bookingsRouter);

export default router;
