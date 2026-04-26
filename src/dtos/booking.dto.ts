enum BookingStatus {
    PENDING= "pending",
    CONFIRMED= "confirmed",
    CANCELLED= "cancelled"
}

interface create {
    userId: number;
    hotelId: number;
    bookingAmount: number;
    totalGuests: number;
    status: BookingStatus;
}

export { create };
