export interface CreateBookingDto {
	userId: number;
	hotelId: number;
	bookingAmount: number;
	totalGuests: number;
}

export interface UpdateBookingDto {
	userId?: number;
	hotelId?: number;
	bookingAmount?: number;
	totalGuests?: number;
}
