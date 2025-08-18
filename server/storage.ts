import { users, timeSlots, bookings, type User, type UpsertUser, type TimeSlot, type InsertTimeSlot, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Time slot management
  getTimeSlotsByDate(date: string): Promise<TimeSlot[]>;
  createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlot(id: number, updates: Partial<TimeSlot>): Promise<TimeSlot | undefined>;
  deleteTimeSlot(id: number): Promise<boolean>;
  
  // Booking management
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined>;
  getBookingsByDate(date: string): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Time slot management
  async getTimeSlotsByDate(date: string): Promise<TimeSlot[]> {
    return await db.select().from(timeSlots).where(eq(timeSlots.date, date));
  }

  async createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot> {
    const [newSlot] = await db.insert(timeSlots).values(slot).returning();
    return newSlot;
  }

  async updateTimeSlot(id: number, updates: Partial<TimeSlot>): Promise<TimeSlot | undefined> {
    const [updatedSlot] = await db
      .update(timeSlots)
      .set(updates)
      .where(eq(timeSlots.id, id))
      .returning();
    return updatedSlot || undefined;
  }

  async deleteTimeSlot(id: number): Promise<boolean> {
    const result = await db.delete(timeSlots).where(eq(timeSlots.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Booking management
  async createBooking(booking: InsertBooking): Promise<Booking> {
    try {
      const [newBooking] = await db.insert(bookings).values(booking).returning();
      console.log('✅ Booking created successfully:', { id: newBooking.id, customerName: newBooking.customerName });
      return newBooking;
    } catch (error) {
      console.error('❌ Database error in createBooking:');
      console.error('📋 Booking data:', JSON.stringify(booking, null, 2));
      console.error('🔍 Error details:', error);
      
      // Extract specific column errors from PostgreSQL error messages
      if (error instanceof Error && error.message.includes('column')) {
        const columnMatch = error.message.match(/column "([^"]+)"/);
        if (columnMatch) {
          console.error(`🎯 Missing column detected: ${columnMatch[1]}`);
        }
      }
      
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateBookingCalInfo(
    id: number, 
    calData: {
      calBookingId?: string;
      calEventId?: string;
      calStatus?: string;
      calSyncedAt?: Date;
    }
  ): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        ...calData,
        calSyncedAt: calData.calSyncedAt || new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async updateBookingGoogleCalendarInfo(
    id: number, 
    googleData: {
      googleEventId?: string;
      googleCalendarId?: string;
      googleSyncStatus?: string;
      googleSyncedAt?: Date;
    }
  ): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        ...googleData,
        googleSyncedAt: googleData.googleSyncedAt || new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, paymentIntentId })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.date, date));
  }
}

export const storage = new DatabaseStorage();
