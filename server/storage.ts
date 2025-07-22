import { users, timeSlots, bookings, type User, type InsertUser, type TimeSlot, type InsertTimeSlot, type Booking, type InsertBooking } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Time slot management
  getTimeSlotsByDate(date: string): Promise<TimeSlot[]>;
  createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlot(id: number, updates: Partial<TimeSlot>): Promise<TimeSlot | undefined>;
  deleteTimeSlot(id: number): Promise<boolean>;
  
  // Booking management
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined>;
  getBookingsByDate(date: string): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private timeSlots: Map<number, TimeSlot>;
  private bookings: Map<number, Booking>;
  private currentUserId: number;
  private currentTimeSlotId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.timeSlots = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentTimeSlotId = 1;
    this.currentBookingId = 1;

    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@rideconnect.com",
    }).then(user => {
      this.users.set(user.id, { ...user, isAdmin: true });
    });

    // Create some default time slots for today and tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const defaultSlots = [
      { date: today, startTime: "09:00", endTime: "09:30", isAvailable: true },
      { date: today, startTime: "10:30", endTime: "11:00", isAvailable: true },
      { date: today, startTime: "12:00", endTime: "12:30", isAvailable: true },
      { date: today, startTime: "14:30", endTime: "15:00", isAvailable: true },
      { date: today, startTime: "16:00", endTime: "16:30", isAvailable: true },
      { date: today, startTime: "18:30", endTime: "19:00", isAvailable: true },
      { date: tomorrow, startTime: "09:00", endTime: "09:30", isAvailable: true },
      { date: tomorrow, startTime: "10:30", endTime: "11:00", isAvailable: true },
      { date: tomorrow, startTime: "12:00", endTime: "12:30", isAvailable: true },
      { date: tomorrow, startTime: "14:30", endTime: "15:00", isAvailable: true },
      { date: tomorrow, startTime: "16:00", endTime: "16:30", isAvailable: true },
      { date: tomorrow, startTime: "18:30", endTime: "19:00", isAvailable: true },
    ];

    defaultSlots.forEach(slot => {
      this.createTimeSlot(slot);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  async getTimeSlotsByDate(date: string): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values()).filter(slot => slot.date === date);
  }

  async createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot> {
    const id = this.currentTimeSlotId++;
    const timeSlot: TimeSlot = { 
      ...slot, 
      id,
      isAvailable: slot.isAvailable ?? true
    };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }

  async updateTimeSlot(id: number, updates: Partial<TimeSlot>): Promise<TimeSlot | undefined> {
    const slot = this.timeSlots.get(id);
    if (!slot) return undefined;
    
    const updatedSlot = { ...slot, ...updates };
    this.timeSlots.set(id, updatedSlot);
    return updatedSlot;
  }

  async deleteTimeSlot(id: number): Promise<boolean> {
    return this.timeSlots.delete(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: new Date(),
      paymentIntentId: null,
      status: booking.status || "pending",
      customerPhone: booking.customerPhone || null,
      notes: booking.notes || null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { 
      ...booking, 
      status, 
      paymentIntentId: paymentIntentId || null 
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.date === date);
  }
}

export const storage = new MemStorage();
