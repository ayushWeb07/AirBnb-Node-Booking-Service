import z from "zod";

const createSchema = z.object({
    userId: z.number().nonnegative(),
    hotelId: z.number().nonnegative(),
    bookingAmount: z.number().gt(0),
    totalGuests: z.number().gt(0),
    status: z.enum(["pending", "confirmed", "cancelled"])
});

const getByIdSchema = z.object({
    id: z.coerce.number().nonnegative(),
});

const removeSchema = z.object({
    id: z.coerce.number().nonnegative(),
});

const updateBodySchema = z.object({
    userId: z.number().nonnegative().optional(),
    hotelId: z.number().nonnegative().optional(),
    bookingAmount: z.number().gt(0).optional(),
    totalGuests: z.number().gt(0).optional()
});

const updateUrlParamsSchema = z.object({
    id: z.coerce.number().nonnegative(),
});

export { createSchema, getByIdSchema, removeSchema, updateBodySchema, updateUrlParamsSchema };
