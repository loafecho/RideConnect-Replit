import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

// User Document Interface
export interface IUser extends Document {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true,
  _id: false,
});

export const User = model<IUser>('User', userSchema);

// Session Document Interface (for express-session)
export interface ISession extends Document {
  _id: string;
  expires: Date;
  session: any;
}

// Session Schema
const sessionSchema = new Schema<ISession>({
  _id: { type: String, required: true },
  expires: { type: Date, required: true },
  session: { type: Schema.Types.Mixed, required: true },
}, {
  _id: false,
});

sessionSchema.index({ expires: 1 });

export const Session = model<ISession>('Session', sessionSchema);

// TimeSlot Document Interface
export interface ITimeSlot extends Document {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// TimeSlot Schema
const timeSlotSchema = new Schema<ITimeSlot>({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
});

timeSlotSchema.index({ date: 1 });

export const TimeSlot = model<ITimeSlot>('TimeSlot', timeSlotSchema);

// Booking Document Interface
export interface IBooking extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  timeSlot: string;
  passengerCount: number;
  notes?: string;
  isAirportRoute: boolean;
  estimatedPrice: string;
  status: string;
  paymentIntentId?: string;
  googleEventId?: string;
  googleCalendarId?: string;
  googleSyncStatus?: string;
  googleSyncedAt?: Date;
  createdAt: Date;
}

// Booking Schema
const bookingSchema = new Schema<IBooking>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  passengerCount: { type: Number, default: 1 },
  notes: String,
  isAirportRoute: { type: Boolean, default: false },
  estimatedPrice: { type: String, required: true },
  status: { type: String, default: 'pending' },
  paymentIntentId: String,
  googleEventId: String,
  googleCalendarId: String,
  googleSyncStatus: String,
  googleSyncedAt: Date,
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);

// Zod validation schemas (for compatibility with existing code)
export const insertTimeSlotSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean().optional(),
});

export const insertBookingSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Drop-off location is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  passengerCount: z.number().min(1).max(6),
  notes: z.string().optional(),
  isAirportRoute: z.boolean().default(false),
  estimatedPrice: z.string(),
  status: z.string().optional(),
  paymentIntentId: z.string().optional(),
  googleEventId: z.string().optional(),
  googleCalendarId: z.string().optional(),
  googleSyncStatus: z.string().optional(),
});

// Type exports for compatibility
export type UpsertUser = Partial<IUser> & { _id: string };
export type TimeSlotType = ITimeSlot;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type BookingType = IBooking;
export type InsertBooking = z.infer<typeof insertBookingSchema>;