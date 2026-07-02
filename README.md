# 📅 Booking Service

> The transaction core of **AirBnB-Node** — orchestrates the multi-service handshake that turns "these rooms, these dates" into a confirmed booking, without ever double-booking a room.

Booking Service doesn't own hotels or rooms — `HotelService` does. It doesn't own users — that's fronted through the API Gateway. What it owns is the **booking transaction itself**: validating every precondition across services, holding a distributed lock so two concurrent requests can't grab the same inventory, and taking a booking through its lifecycle from `pending` → `confirmed` (or `cancelled`).

---

## Where this fits in the system

```
        ┌──────────────────┐
        │   API Gateway     │──── user lookups
        └─────────┬─────────┘
                   │
         ┌─────────▼──────────┐        ┌───────────────────┐
         │   BookingService     │◄──────►│   HotelService     │
         │   (this repo)        │        │  hotels/rooms/types │
         └─────────┬─────────-─┘        └───────────────────┘
                   │
       ┌───────────┼────────────┐
       │                        │
┌──────▼───────┐      ┌─────────▼─────────┐
│  MySQL         │      │  Redis              │
│  (bookings)    │      │  Redlock + BullMQ    │
└────────────────┘      │  (locking + mailer)  │
                         └───────────────────────┘
```

A single `POST /bookings` call fans out to: the API Gateway (does this user exist?), HotelService (does this hotel/room type exist, and are enough rooms actually free for these dates?), Redis (acquire an exclusive lock on this hotel + room type), MySQL (persist the booking), and back to HotelService (stamp the booking ID onto the specific rooms). If any of these fail, the whole thing fails loudly rather than leaving inventory in a half-booked state.

---

## What it does

- **Cross-service precondition validation.** Before a booking is even considered, the service confirms the user exists (via the API Gateway), the hotel exists, the room type exists *and belongs to that hotel*, and that the requested room count doesn't exceed the room type's configured inventory — all in a single request pipeline, each with its own explicit not-found/error handling.
- **Real-time availability check.** It calls `HotelService`'s `/rooms/check-available` to get the actual free room-date rows for the stay window, then confirms there are enough distinct rooms to cover every night of the stay (`totalNights × totalRooms`) before going any further.
- **Distributed locking with Redlock.** Because two people can try to book the last room of the same hotel/room-type at the same instant, the service acquires a Redis-backed distributed lock (`lock:hotelId-{id}|roomTypeId-{id}`) before writing the booking row, so concurrent requests are serialized instead of racing. A locked resource surfaces as a clean `403` — "someone else is booking this right now" — instead of a silent overbook.
- **Idempotency.** Every booking is created with a server-generated `idempotencyKey` (UUID). Clients use it to safely retry a finalize call without risking a double-confirmation — the service checks the current `status` and rejects finalizing a booking that isn't still `pending`.
- **Booking lifecycle.** Bookings move through `pending → confirmed` or `pending → cancelled`. Creation puts a booking in `pending` state (and books the underlying rooms in HotelService); a separate finalize/confirm step is what actually commits it, keeping payment/confirmation concerns decoupled from the initial reservation.
- **Async, decoupled notifications.** Booking-related emails are pushed onto a BullMQ `mailer` queue rather than sent inline — this service is a *producer* only; a separate worker (in this or another service) is expected to consume the queue and actually send mail, so a flaky mail provider never blocks a booking request.

---

## Booking lifecycle

```
        POST /bookings
              │
              ▼
   ┌─────────────────────┐
   │ validate user, hotel, │
   │ room type, dates,     │
   │ availability          │
   └──────────┬────────────┘
              │
              ▼
   ┌─────────────────────┐        403 → resource locked,
   │ acquire Redlock on    │ ──────►  someone else is booking
   │ hotelId + roomTypeId  │          this right now
   └──────────┬────────────┘
              │
              ▼
   ┌─────────────────────┐
   │ insert booking row     │  status = "pending"
   │ (idempotencyKey issued)│
   └──────────┬────────────┘
              │
              ▼
   ┌─────────────────────┐
   │ stamp bookingId onto   │──► HotelService /rooms/book-rooms
   │ the specific rooms     │
   └──────────┬────────────┘
              │
              ▼
   PATCH /bookings/finalize/:idempotencyKey
              │
              ▼
     status = "confirmed"        (or /bookings/cancel/:id → "cancelled")
```

---

## Tech stack

| Concern | Choice |
|---|---|
| Language / runtime | TypeScript on Node.js (ESM) |
| Web framework | Express 5 |
| ORM / migrations | Drizzle ORM + `drizzle-kit` |
| Database | MySQL |
| Distributed locking | Redlock (Redis-backed) |
| Background jobs | BullMQ (mailer queue producer) |
| Validation | Zod |
| Logging | Winston (+ daily rotation), shipped to Logtail |
| Error tracking | Sentry |
| Uptime monitoring | BetterStack heartbeat pings |
| Lint / format | Biome |

---

## Project structure

```
src/
├── config/            # Env config, DB, Redis, Redlock, logger, Sentry, graceful shutdown
├── controllers/        # Thin HTTP handlers — parse request, call service, respond
├── services/           # Orchestration layer over the repository
├── repositories/        # Cross-service HTTP calls, Redlock locking, and all DB access
├── db/
│   ├── schemas/          # Drizzle schema (bookings table)
│   └── migrations/       # Versioned schema changes
├── dtos/               # Shape contracts (CreateBookingDto, AddEmailDto)
├── validators/          # Zod schemas for request body/params
├── routers/v1/          # Route definitions
├── middlewares/         # Correlation ID injection, centralized error handling
├── queues/              # BullMQ mailer queue definition
├── producers/           # Code that enqueues mailer jobs
├── utils/               # App errors, server bootstrap, heartbeat pings
└── index.ts             # App composition root
```

Unlike a typical CRUD service, most of the interesting logic lives in the **repository layer** rather than the service layer — `booking.repository.ts` is where the cross-service calls, availability math, and Redlock acquisition all happen, since creating a booking is fundamentally a distributed transaction rather than a single DB write.

---

## API surface (v1)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/v1/bookings` | List bookings |
| `GET` | `/api/v1/bookings/:id` | Get a booking |
| `POST` | `/api/v1/bookings` | Create a booking (validates, locks, reserves rooms) → `pending` |
| `PATCH` | `/api/v1/bookings/finalize/:idempotencyKey` | Finalize a pending booking → `confirmed` |
| `PATCH` | `/api/v1/bookings/confirm/:id` | Directly mark a booking as `confirmed` |
| `PATCH` | `/api/v1/bookings/cancel/:id` | Mark a booking as `cancelled` |
| `DELETE` | `/api/v1/bookings/:id` | Remove a booking record |

---

## Getting started

### Prerequisites

- Node.js + [pnpm](https://pnpm.io/) (`pnpm@10.27.0` pinned via `packageManager`)
- MySQL running locally or reachable
- Redis running locally or reachable (used for Redlock and BullMQ)
- `HotelService` and the API Gateway reachable, since booking creation calls out to both

### Install

```bash
git clone https://github.com/ayushWeb07/AirBnb-Node-Booking-Service.git
cd AirBnb-Node-Booking-Service
pnpm install
```

### Configure environment

Create a `.env` file in the project root:

```bash
# Server
PORT=3002

# Database (Drizzle connection string)
DATABASE_URL=mysql://root:@localhost:3306/airbnb_dev

# Redis / Redlock / BullMQ
REDIS_SERVER_HOST=localhost
REDIS_SERVER_PORT=6379
REDIS_LOCK_TTL=1000
BULLMQ_MAILER_QUEUE_NAME=queue-mailer
BULLMQ_MAILER_PAYLOAD_NAME=payload-mailer
BULLMQ_MAILER_ADD_EMAIL_ATTEMPTS=3
BULLMQ_MAILER_ADD_EMAIL_DELAY=1000

# Inter-service
HOTEL_SERVICE_BASE_URL=http://localhost:3001/api/v1
API_GATEWAY_BASE_URL=http://localhost:3000/api/v1

# Observability (optional)
SENTRY_DSN=
LOGTAIL_SOURCE_TOKEN=
LOGTAIL_URL=
BETTERSTACK_HEARTBEAT_URL=
```

### Generate & run migrations

```bash
pnpm run db:generate   # generate a new migration from schema changes
pnpm run db:migrate    # apply migrations
```

### Start the service

```bash
pnpm run dev
```

---

## Design notes worth knowing

- **Locking scope is deliberately coarse.** The Redlock key is `hotelId + roomTypeId`, not individual room IDs — this trades a little concurrency for a lot of simplicity, since figuring out exactly which room rows a competing request would touch ahead of time is harder than just serializing all bookings for that room type. `REDIS_LOCK_TTL` bounds how long a stuck lock can block subsequent bookings.
- **Two-phase commit, sort of.** `createBooking` writes the row and books the rooms in HotelService as part of the same call, but the booking stays `pending` until a separate `finalize` call — leaving room for a payment step, confirmation email, or other side effect to happen in between without rooms being visibly "confirmed" before payment clears.
- **No shared database with HotelService.** Every fact this service needs about hotels, room types, and room availability comes from HTTP calls to `HotelService`, never a direct query — the two services can evolve their schemas independently.
- **Notifications are fire-and-forget from this service's perspective.** `addEmailToQueue` just enqueues; there's no mailer worker in this repo. That's expected — the worker that actually sends the email is a separate consumer process (this or another service) reading off the same Redis-backed `queue-mailer` queue.
- **Idempotency key, not booking ID, drives finalize.** Finalization is keyed off the UUID returned at creation time rather than the numeric booking ID, so a client that's unsure whether its create request landed can safely retry finalize without needing to look up an ID first.