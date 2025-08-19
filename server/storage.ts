import { User, TimeSlot, Booking, IUser, ITimeSlot, IBooking, UpsertUser, InsertTimeSlot, InsertBooking } from "@shared/mongoSchema";
import { connectDB } from "./db";

// Ensure database is connected
await connectDB();

// Type aliases for compatibility with existing code
export type TimeSlotType = ITimeSlot;
export type BookingType = IBooking;

export interface IStorage {
  // User operations (IMPORTANT for Replit Auth)
  getUser(id: string): Promise<IUser | undefined>;
  upsertUser(user: UpsertUser): Promise<IUser>;
  
  // Time slot management
  getTimeSlotsByDate(date: string): Promise<ITimeSlot[]>;
  createTimeSlot(slot: InsertTimeSlot): Promise<ITimeSlot>;
  updateTimeSlot(id: string, updates: Partial<ITimeSlot>): Promise<ITimeSlot | undefined>;
  deleteTimeSlot(id: string): Promise<boolean>;
  
  // Booking management
  createBooking(booking: InsertBooking): Promise<IBooking>;
  getBooking(id: string): Promise<IBooking | undefined>;
  getBookings(): Promise<IBooking[]>;
  getBookingById(id: string): Promise<IBooking | undefined>;
  updateBookingStatus(id: string, status: string, paymentIntentId?: string): Promise<IBooking | undefined>;
  getBookingsByDate(date: string): Promise<IBooking[]>;
  updateBookingGoogleCalendarInfo(
    id: string,
    googleData: {
      googleEventId?: string;
      googleCalendarId?: string;
      googleSyncStatus?: string;
      googleSyncedAt?: Date;
    }
  ): Promise<IBooking | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT for Replit Auth)
  async getUser(id: string): Promise<IUser | undefined> {
    try {
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userData._id,
        {
          ...userData,
          updatedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      return user!;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Time slot management
  async getTimeSlotsByDate(date: string): Promise<ITimeSlot[]> {
    try {
      const slots = await TimeSlot.find({ date });
      return slots;
    } catch (error) {
      console.error('Error getting time slots:', error);
      return [];
    }
  }

  async createTimeSlot(slot: InsertTimeSlot): Promise<ITimeSlot> {
    try {
      const newSlot = new TimeSlot(slot);
      await newSlot.save();
      return newSlot;
    } catch (error) {
      console.error('Error creating time slot:', error);
      throw error;
    }
  }

  async updateTimeSlot(id: string, updates: Partial<ITimeSlot>): Promise<ITimeSlot | undefined> {
    try {
      const updatedSlot = await TimeSlot.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
      return updatedSlot || undefined;
    } catch (error) {
      console.error('Error updating time slot:', error);
      return undefined;
    }
  }

  async deleteTimeSlot(id: string): Promise<boolean> {
    try {
      const result = await TimeSlot.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting time slot:', error);
      return false;
    }
  }

  // Booking management
  async createBooking(booking: InsertBooking): Promise<IBooking> {
    try {
      const newBooking = new Booking({
        ...booking,
        status: booking.status || 'pending',
      });
      await newBooking.save();
      console.log('✅ Booking created successfully:', { id: newBooking._id, customerName: newBooking.customerName });
      return newBooking;
    } catch (error) {
      console.error('❌ Database error in createBooking:');
      console.error('📋 Booking data:', JSON.stringify(booking, null, 2));
      console.error('🔍 Error details:', error);
      
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateBookingCalInfo(
    id: string,
    calData: {
      calBookingId?: string;
      calEventId?: string;
      calStatus?: string;
      calSyncedAt?: Date;
    }
  ): Promise<IBooking | undefined> {
    // Cal.com integration deprecated, keeping method for compatibility
    return undefined;
  }

  async updateBookingGoogleCalendarInfo(
    id: string,
    googleData: {
      googleEventId?: string;
      googleCalendarId?: string;
      googleSyncStatus?: string;
      googleSyncedAt?: Date;
    }
  ): Promise<IBooking | undefined> {
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        {
          ...googleData,
          googleSyncedAt: googleData.googleSyncedAt || new Date(),
        },
        { new: true }
      );
      return updatedBooking || undefined;
    } catch (error) {
      console.error('Error updating booking Google Calendar info:', error);
      return undefined;
    }
  }

  async getBooking(id: string): Promise<IBooking | undefined> {
    try {
      const booking = await Booking.findById(id);
      return booking || undefined;
    } catch (error) {
      console.error('Error getting booking:', error);
      return undefined;
    }
  }

  async getBookings(): Promise<IBooking[]> {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return bookings;
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  async getBookingById(id: string): Promise<IBooking | undefined> {
    return this.getBooking(id);
  }

  async updateBookingStatus(id: string, status: string, paymentIntentId?: string): Promise<IBooking | undefined> {
    try {
      const updates: any = { status };
      if (paymentIntentId) {
        updates.paymentIntentId = paymentIntentId;
      }
      
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
      return updatedBooking || undefined;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }

  async getBookingsByDate(date: string): Promise<IBooking[]> {
    try {
      const bookings = await Booking.find({ date });
      return bookings;
    } catch (error) {
      console.error('Error getting bookings by date:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();