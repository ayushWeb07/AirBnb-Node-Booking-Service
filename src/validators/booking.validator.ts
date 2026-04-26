import z from "zod";

const createSchema = z.object({
    userId: z.number().nonnegative(),
    hotelId: z.number().nonnegative(),
    bookingAmount: z.number().gt(0),
    totalGuests: z.number().gt(0),
    status: z.enum(["pending", "confirmed", "cancelled"])
});

export { createSchema };
