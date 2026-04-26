import { mysqlTable, int, mysqlEnum, timestamp } from "drizzle-orm/mysql-core"

export const bookings = mysqlTable('bookings', {
    id: int("id").primaryKey().autoincrement(),
    userId: int("userId").notNull(),
    hotelId: int("hotelId").notNull(),
    bookingAmount: int("bookingAmount").notNull(),
    totalGuests: int("totalGuests").notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).notNull().default("pending"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow()
});
