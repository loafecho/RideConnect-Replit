import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  passengerCount: integer("passenger_count").default(1),
  notes: text("notes"),
  isAirportRoute: boolean("is_airport_route").default(false),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  paymentIntentId: text("payment_intent_id"),
  // Cal.com integration fields (deprecated but kept for migration)
  calBookingId: text("cal_booking_id"), // Cal.com booking reference
  calEventId: text("cal_event_id"), // Cal.com event reference
  calStatus: text("cal_status"), // Cal.com sync status: synced, failed, pending
  calSyncedAt: timestamp("cal_synced_at"), // Last successful sync with Cal.com
  // Google Calendar integration fields
  googleEventId: text("google_event_id"), // Google Calendar event ID
  googleCalendarId: text("google_calendar_id"), // Google Calendar ID (for multiple calendars)
  googleSyncStatus: text("google_sync_status"), // Google Calendar sync status: synced, failed, pending
  googleSyncedAt: timestamp("google_synced_at"), // Last successful sync with Google Calendar
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  paymentIntentId: true,
  calBookingId: true,
  calEventId: true,
  calStatus: true,
  calSyncedAt: true,
  googleEventId: true,
  googleCalendarId: true,
  googleSyncStatus: true,
  googleSyncedAt: true,
}).extend({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Drop-off location is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  passengerCount: z.number().min(1).max(6),
  isAirportRoute: z.boolean().default(false),
  estimatedPrice: z.string(),
});

// Types
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
