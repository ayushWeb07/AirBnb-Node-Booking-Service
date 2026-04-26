import type { Request, Response } from "express";
import * as bookingService from "../services/booking.service.ts";

import {
    StatusCodes
} from 'http-status-codes';

const create = async (req: Request, res: Response) => {
    const booking = await bookingService.create(req.body);

    res.status(StatusCodes.CREATED).json({
        message: "A new booking was created successfully",
        data: booking,
        success: true
    });
};

const getAll = async (req: Request, res: Response) => {
    const bookings = await bookingService.getAll();

    res.status(StatusCodes.OK).json({
        message: "Fetched all the bookings successfully",
        data: bookings,
        success: true
    });
};

const getById = async (req: Request, res: Response) => {
    const booking = await bookingService.getById(Number(req.params.id));

    res.status(StatusCodes.OK).json({
        message: "Fetched the booking successfully",
        data: booking,
        success: true
    });
};

const remove = async (req: Request, res: Response) => {
    const booking = await bookingService.remove(Number(req.params.id));

    res.status(StatusCodes.OK).json({
        message: "Removed the booking successfully",
        data: booking,
        success: true
    });
};

const update = async (req: Request, res: Response) => {
    const booking = await bookingService.update(Number(req.params.id), req.body);

    res.status(StatusCodes.OK).json({
        message: "Updated the booking successfully",
        data: booking,
        success: true
    });
};

export { create, getAll, getById, remove, update };