export interface CreateBookingDto {
	userId: number;
	hotelId: number;
	roomTypeId: number;
	bookingAmount: number;
	totalGuests: number;
	totalRooms: number;
	checkInDate: string;
	checkOutDate: string;
}

export interface UpdateBookingDto {
	userId?: number;
	hotelId?: number;
	roomTypeId?: number;
	bookingAmount?: number;
	totalGuests?: number;
	totalRooms?: number;
	checkInDate?: string;
	checkOutDate?: string;
}
