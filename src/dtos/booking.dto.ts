const BookingStatus= {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled"
} as const;

type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface CreateBookingDto {
    userId: number;
    hotelId: number;
    bookingAmount: number;
    totalGuests: number;
    status: BookingStatus;
}

export interface UpdateBookingDto {
    userId?: number;
    hotelId?: number;
    bookingAmount?: number;
    totalGuests?: number;
    status?: BookingStatus;
}