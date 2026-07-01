ALTER TABLE `bookings` ADD COLUMN `checkInDate` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `bookings` ADD COLUMN `checkOutDate` timestamp NOT NULL DEFAULT (now());